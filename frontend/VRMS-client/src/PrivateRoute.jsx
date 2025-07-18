import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PrivateRoute = ({ children }) => {

        const token = Cookies.get('token');
        if (!token) {
          Cookies.remove('refreshExpiresAt', { path: '/' });
          return <Navigate to="/login" replace />;
        }
return children;
};

export default PrivateRoute;