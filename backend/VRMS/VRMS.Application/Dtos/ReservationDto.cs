using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VRMS.Domain.Entities;

namespace VRMS.Application.Dtos
{
    public class ReservationDto
    {
        public ReservationDto() { }
        public ReservationDto(Reservation reservation)
        {
            ReservationId = reservation.ReservationId;
            CustomerId = reservation.CustomerId;
            VehicleId = reservation.VehicleId;
            StartDate = reservation.StartDate;
            EndDate = reservation.EndDate;
            Status = reservation.Status;
            CreatedAt = reservation.CreatedAt;
            UpdatedAt = reservation.UpdatedAt;

            PickedUp = reservation.PickedUp;
            BroughtBack = reservation.BroughtBack;
        }


        public int ReservationId { get; set; }        
        public int CustomerId { get; set; }           
        public int VehicleId { get; set; }            

        public DateTime StartDate { get; set; }       
        public DateTime EndDate { get; set; }         
        public ReservationStatus Status { get; set; }
        public bool PickedUp { get; set; }
        public bool BroughtBack { get; set; }
        public DateTime CreatedAt { get; set; }       
        public DateTime? UpdatedAt { get; set; }      

    }
}
