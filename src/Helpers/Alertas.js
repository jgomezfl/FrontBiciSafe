import * as React from 'react';
import { Snackbar, Alert } from '@mui/material';

export const InstantMessage = ({message}) => {
    const [open, setOpen] = React.useState(true);

    const handleClose = (event, reason) => {
        // if (reason === 'clickaway'){
        //     return;
        // }
        setOpen(false);
    };

    return (
        <Snackbar open={open}
            autoHideDuration={6000}
            onClose={handleClose}>
            <Alert onClose={handleClose} severity="error">
                {message}
            </Alert>
        </Snackbar>
    )
}

export const SuccessMessage = ({message}) => {
    const [open, setOpen] = React.useState(true);

    const handleClose = (event, reason) => {
        setOpen(false);
    };

    return (
        <Snackbar open={open}
            autoHideDuration={6000}
            onClose={handleClose}>
            <Alert onClose={handleClose} severity="success">
                {message}
            </Alert>
        </Snackbar>
    )
}