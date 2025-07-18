// src/components/vehicle/ratings/VehicleRating.jsx

import React, { useState, useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Stack
} from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { Add, Delete, Edit } from '@mui/icons-material'
import Cookies from 'js-cookie'
import { decodeToken } from '../../../../decodeToken' // ✅ import it here
import ConfirmDialog from '../../../../utils/ConfirmDialog' // adjust path if needed
import { api } from '@/apiClient'

import AddVehicleRating from './addvehiclerating'
import UpdateVehicleRating from './updatevehiclerating'
import VehicleRatingViewCustomer from './VehicleRatingViewCustomer' // ✅ import it

// Export helpers
import { exportAsCSV } from '../Exports/exportCsv'
import { exportAsExcel } from '../Exports/exportExcel'
import { exportAsPDF } from '../Exports/exportPdf'
import { exportAsJSON } from '../Exports/exportJson'

// Import helpers
import { importExcel } from '../Imports/importExcel'
import { importCsv } from '../Imports/importCsv'
import { importJson } from '../Imports/importJson'

export function VehicleRating() {
  const [ratings, setRatings] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [customer, setCustomer] = useState([])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState(null)

  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)

  const navigate = useNavigate()
  const location = useLocation()

  // ===== TOKEN & PAYLOAD =====
  const token = Cookies.get('token')
  const payload = token ? decodeToken(token) : {}
  const userRole = payload.role
  // ✅ Make sure userId is a number, so we can compare against customerId
  const userId = payload.userId ? parseInt(payload.userId, 10) : null

  // ===== fetch ratings, vehicles, customers =====
  useEffect(() => {
    api
      .get('/vehicle-ratings/ratings')
      .then(res => setRatings(res.data))
      .catch(console.error)

    api
      .get('/vehicles/vehicles')
      .then(res => setVehicles(res.data))
      .catch(console.error)

    api
      .get('/customers/customers')
      .then(res => setCustomer(res.data))
      .catch(console.error)
  }, [])

  // ===== file‐import handler =====
  const handleFileInputChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const extension = file.name.split('.').pop().toLowerCase()
    let data = []

    try {
      if (extension === 'xlsx' || extension === 'xls') {
        data = await importExcel(file)
      } else if (extension === 'csv') {
        data = await importCsv(file)
      } else if (extension === 'json') {
        data = await importJson(file)
      } else {
        setSnackbarMessage('Unsupported file format.')
        setShowSnackbar(true)
        return
      }

      const requiredFields = ['vehicleId', 'ratingValue']

      for (let row of data) {
        const missing = requiredFields.filter(f => !row[f])
        if (missing.length > 0) {
          setSnackbarMessage(`Missing fields: ${missing.join(', ')}`)
          setShowSnackbar(true)
          return
        }
      }

      let hasErrors = false
      for (const row of data) {
        try {
          await api.post('/vehicle-ratings/create-rating', row)
        } catch (err) {
          hasErrors = true
          setSnackbarMessage(`Error importing row: ${err.response?.data?.message}`)
          setShowSnackbar(true)
          break
        }
      }

      if (!hasErrors) {
        setSnackbarMessage('Import successful')
        setShowSnackbar(true)
        setTimeout(() => window.location.reload(), 1000)
      }
    } catch (err) {
      console.error(err)
      setSnackbarMessage('Import failed.')
      setShowSnackbar(true)
    }
  }

  // ===== help get vehicle name from vehicleId =====
  const getVehicleName = (id) => {
    const v = vehicles.find(x => x.vehicleId === id)
    return v ? `${v.mark} ${v.model}` : id
  }

  // ===== help get customer username from userId =====
  const getCustomerName = (custId) => {
    const customerMatch = customer.find(c => c.userId === custId)
    return customerMatch ? customerMatch.username : 'Unknown'
  }

  // ===== delete handler =====
  const handleDelete = async () => {
    try {
      await api.delete(`/vehicle-ratings/delete-rating/${deleteId}`)
      setRatings((prev) => prev.filter(r => r.id !== deleteId))
      setShowDeleteDialog(false)
    } catch (e) {
      console.error(e)
    }
  }

  // ===== if navigated with state to pre-open Add modal =====
  useEffect(() => {
    if (location.state?.vehicleId && location.state?.showCreateForm) {
      setSelectedVehicleId(location.state.vehicleId)
      setShowCreateForm(true)
      navigate(location.pathname, { replace: true })
    }
  }, [location.state, navigate, location.pathname])

  // ===== columns for admin / other roles =====
  const columns = [
    {
      field: 'vehicleId',
      headerName: 'Vehicle',
      flex: 1,
      renderCell: (params) => getVehicleName(params.value)
    },
    {
      field: 'customerId',
      headerName: 'Customer',
      flex: 1,
      renderCell: (params) => getCustomerName(params.value)
    },
    { field: 'ratingValue', headerName: 'Rating', flex: 0.5 },
    {
      field: 'reviewComment',
      headerName: 'Comment',
      flex: 1,
      renderCell: (params) => params.value || '—'
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      flex: 1,
      renderCell: (params) => {
        const d = new Date(params.value)
        return isNaN(d) ? '' : d.toLocaleDateString()
      }
    },
    {
      field: 'update',
      headerName: 'Edit',
      sortable: false,
      width: 90,
      renderCell: (params) => (
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => {
            setSelectedId(params.row.id)
            setShowUpdateForm(true)
          }}
        />
      )
    },
    // only Admin sees the Delete column
    ...(userRole === 'Admin'
      ? [
          {
            field: 'delete',
            headerName: 'Delete',
            sortable: false,
            width: 90,
            renderCell: (params) => (
              <Button
                variant="contained"
                color="error"
                startIcon={<Delete />}
                onClick={() => {
                  setDeleteId(params.row.id)
                  setShowDeleteDialog(true)
                }}
              />
            )
          }
        ]
      : [])
  ]

  return (
    <div>
      {/* ===== Top‐bar for non‐Customers ===== */}
      {userRole !== 'Customer' && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowCreateForm(true)}
          >
            Add
          </Button>

          <Stack direction="row" spacing={1}>
            <Button variant="contained" color="primary" onClick={(e) => setAnchorEl(e.currentTarget)}>
              {/* Export icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                style={{ marginRight: '8px', width: '20px', height: '20px' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 
                     2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 
                     2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 
                     0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
                />
              </svg>
              Export
            </Button>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null)
                  const processed = ratings.map((r) => ({
                    ...r,
                    createdAt: new Date(r.createdAt).toISOString()
                  }))
                  exportAsCSV(processed, 'ratings.csv')
                }}
              >
                Export as CSV
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null)
                  const processed = ratings.map((r) => ({
                    ...r,
                    createdAt: new Date(r.createdAt).toISOString()
                  }))
                  exportAsExcel(processed, 'ratings.xlsx')
                }}
              >
                Export as Excel
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null)
                  const processed = ratings.map((r) => ({
                    ...r,
                    createdAt: new Date(r.createdAt).toISOString()
                  }))
                  exportAsPDF(processed, 'ratings.pdf')
                }}
              >
                Export as PDF
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null)
                  const processed = ratings.map((r) => ({
                    ...r,
                    createdAt: new Date(r.createdAt).toISOString()
                  }))
                  exportAsJSON(processed, 'ratings.json')
                }}
              >
                Export as JSON
              </MenuItem>
            </Menu>

            <Button variant="contained" color="primary" component="label">
              {/* Import icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                style={{ marginRight: '8px', width: '20px', height: '20px' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 
                     2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 
                     0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 
                     12l3 3m0 0 3-3m-3 3V2.25"
                />
              </svg>
              Import
              <input
                type="file"
                accept=".xlsx, .xls, .csv, .json"
                hidden
                onChange={handleFileInputChange}
              />
            </Button>
          </Stack>
        </Box>
      )}

      {/* ===== CUSTOMER VIEW: pass only this user’s ratings ===== */}
      {userRole === 'Customer' ? (
        <VehicleRatingViewCustomer
          // ✅ Filter so that customer sees only their own ratings
          ratings={ratings.filter((r) => r.customerId === userId)}
          getVehicleName={getVehicleName}
          getCustomerName={getCustomerName}
          onEdit={(id) => {
            setSelectedId(id)
            setShowUpdateForm(true)
          }}
          onDelete={(id) => {
            setDeleteId(id)
            setShowDeleteDialog(true)
          }}
          onAdd={() => setShowCreateForm(true)}
        />
      ) : (
        // ===== NON-CUSTOMER VIEW: full DataGrid =====
        <div style={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={ratings}
            columns={columns}
            pageSize={10}
            getRowId={(row) => row.id}
          />
        </div>
      )}

      {/* ===== Modals ===== */}
      {showCreateForm && (
        <AddVehicleRating
          onClose={() => setShowCreateForm(false)}
          vehicleId={selectedVehicleId}
          onAdded={(newR) => setRatings((prev) => [...prev, newR])}
        />
      )}

      {showUpdateForm && (
        <UpdateVehicleRating
          id={selectedId}
          onClose={() => setShowUpdateForm(false)}
          onUpdated={(upd) =>
            setRatings((prev) => prev.map((r) => (r.id === upd.id ? upd : r)))
          }
        />
      )}

      <ConfirmDialog
        open={showDeleteDialog}
        title="Confirm Delete"
        content="Are you sure you want to delete this rating?"
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
      />

      {/* ===== Error Snackbar ===== */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default VehicleRating
