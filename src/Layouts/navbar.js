///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   importante, el nombre de las cookies son "logged" booleano para ver si esta loggeado y "bcusuario" en este guardamoslos datos del usuario sin el password que no se trae de la bd   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import React from "react";

import logo from "./../assets/logo.png";
import { FiUser } from 'react-icons/fi';

//componentes bootstrap
import { Button, Nav, Navbar, Modal } from 'react-bootstrap';
import { Container, Row, Col } from "react-bootstrap";

//importamos componentes MUI material
import { Typography, IconButton, Paper, Box} from '@mui/material';
import { Visibility, VisibilityOff, AccountCircle, LogoutOutlined, Report, Delete,Add, PedalBike } from '@mui/icons-material'; //importamos los iconos de MUI material
import { OutlinedInput, InputLabel, InputAdornment, FormControl, TextField } from '@mui/material'; //importamos lo necesario para el formulario
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

//importamos componentes de validación de forms
import { Formik } from "formik";
import * as Yup from 'yup';

//importamos componente de la cookies
import Cookies from "universal-cookie";

//importamos alertas
import { SuccessMessage, InstantMessage } from "../Helpers/Alertas";

import { Outlet, Link, useNavigate } from "react-router-dom";

import { useState } from "react";

//importamos API
import API from "../services/http-common";

let validationSchema = Yup.object().shape({
    correo: Yup.string().required('Correo es requerido')
        .email('Email invalido'),
    contrasena: Yup.string().required('Contraseña es requerida')
});

var cookie = new Cookies();

const NavbarExample = () => {
    //estilo icono
    const fontStyles = {fontSize: '40px'};
    const navigate = useNavigate();

    //guardamos los datos del usuario sin el password
    const [biciusuario, setBiciusuario] = useState(cookie.get("bcusuario"));
    //guardamos el estado (true o false)
    const [loggeado, SetLoggeado] = useState(cookie.get("logged"));
    //serie de la bicicleta
    const [serie, setSerie] = useState(null);
    //guardamos las bicicletas
    const [bicicletas, setBicicletas] = useState(cookie.get("bicicletas"));
    //bivivleta a modificar
    const [bicicleta, setBicicleta] = useState(null);
    //constantes booleanas para mostrar el password
    const [showPassword, setShowPassword] = useState(false);

    //Dialogo de eliminación
    const [openDialog, setOpenDialog] = React.useState(false);
    const handleOpenDialog = () => { setOpenDialog(true); };
    const handleCloseDialog = () => { setOpenDialog(false); setSerie(null); };

    //Dialogo de confirmación reporte
    const [openReportDialog, setOpenReportDialog] = React.useState(false);
    const handleOpenReportDialog = () => { setOpenReportDialog(true); };
    const handleCloseReportDialog = () => { setOpenReportDialog(false); };

    //Dialogo de reporte
    // const [openDialogReporte, setOpenDialogReporte] = React.useState(false);
    // const handleOpenDialogReporte = () => { setOpenDialogReporte(true); };
    // const handleCloseDialogReporte = () => { setOpenDialogReporte(false); };

    //mensaje de las alertas
    const [message, setMessage] = React.useState('');
    const [succes, setSucces] = React.useState(false);
    const [error, setError] = React.useState(false);

    //show login modal
    const [showModalLogin, setShowModalLogin] = useState(false);
    const handleOpenLoginModal = () => setShowModalLogin(true);
    const handleCloseLoginModal = () => setShowModalLogin(false);

    //show modal Menu
    const [showModalMenu, setShowModalMenu] = useState(false);
    const handleOpenModalMenu = () => {
        setShowModalMenu(true);

    };
    const handleCloseModalMenu = ()  => setShowModalMenu(false);

    //show modals
    const handleShowModals = () => {
        if(loggeado === undefined){
            handleOpenLoginModal();
        }
        else{
            var path = "bicicletas/select/all/"+biciusuario.ident;
            API.get(path).then(({data}) => {
                setBicicletas(data);
            })
            handleOpenModalMenu();
        }
    }

    const handleShowPassword = () =>{
        setShowPassword(true);
    };
    const handleDontShowPassword = (event) =>{
        event.preventDefault();
        setShowPassword(false);
    };

    function changeBackground(e){
        e.target.style.backgroundColor = "#C6C6C6";
    };

    function changeBackgroundAgain(e){
        e.target.style.backgroundColor = "transparent";
    };

    function cerrarSesion(){
        SetLoggeado(undefined);
        setBiciusuario(undefined);
        setBicicletas(undefined);

        cookie.remove("logged", { path: '/' });
        cookie.remove("bcusuario", { path: '/' });
        cookie.remove("bicicletas", { path: '/' });

        handleCloseModalMenu();
        navigate(("/"));
    }

    function borrarBicicleta(){
        console.log(serie);
        var aux = [];
        for (var i in bicicletas){
            if(bicicletas[i].serie !== serie){
                aux.push(bicicletas[i]);
            }
        }
        setBicicletas(aux);
        cookie.remove("bicicletas", { path: '/' });
        cookie.set("bicicletas", aux, {path: '/'});

        var path = "/bicicletas/delete/"+serie;
        API.delete(path).then(({data}) =>{
            console.log(data);
        })
        handleCloseDialog();
    }

    function reportarBicicleta(){
        var dict = {
            serie: bicicleta.serie,
            ident: biciusuario.ident,
            tipo: "Stolen"
        }
        API.post("/reportes/save",dict).then(({data}) => {
            console.log(data);
        })
        var path = "/bicicletas/update/"+bicicleta.serie;
        API.put(path).then(({data}) => {
            console.log(data);
        })
        var aux = bicicletas;
        for(var i in aux){
            if(aux[i].serie === bicicleta.serie){
                aux[i].robada = true;
            }
        }
        cookie.remove("bicicletas", { path: '/' });
        cookie.set("bicicletas", aux, {path: '/'});
        handleCloseReportDialog();
        handleCloseModalMenu();
        setBicicleta(null);
    }

    return (
        <>
            <Navbar className="color-nav d-flex justify-content-around" collapseOnSelect expand="lg" variant="light">

                <Nav.Link as={Link} to="/">
                    <img
                      onMouseOver={changeBackground} onMouseLeave={changeBackgroundAgain}
                      width="100"
                      height="15%"
                      src={logo}
                      className="d-inline-block align-top"
                      alt="React Bootstrap logo"
                    />
                </Nav.Link>

                <Nav.Link onMouseOver={changeBackground} onMouseLeave={changeBackgroundAgain}>
                    <FiUser onClick={handleShowModals} style={fontStyles} /> 
                </Nav.Link>

                {succes ? <SuccessMessage message = {message}/> : `` }
                {error ? <InstantMessage message = {message}/> : `` }

            </Navbar>

            <Dialog
             open={openDialog}
             onClose={handleCloseDialog}
             aria-labelledby="alert-dialog-title"
             aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">{"¿Deseas Eliminar esta bicicleta?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Por favor confirma en caso de realmente querer eliminar la bicicleta, de otra forma
                        solo cancela la solicitud.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={borrarBicicleta} className="btn btn-danger">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
             open={openReportDialog}
             onClose={handleCloseReportDialog}
             aria-labelledby="alert-dialog-title"
             aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">{"¿Deseas Reportar esta bicicleta?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Por favor confirma en caso de realmente querer reportar la bicicleta como robada, de otra forma
                        solo cancela la solicitud.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseReportDialog} className="btn btn-danger">
                        Cancelar
                    </Button>
                    <Button onClick={reportarBicicleta} className="btn btn-succes">
                        Reportar
                    </Button>
                </DialogActions>
            </Dialog>

            <Modal show={showModalMenu} onHide={handleCloseModalMenu}>
                <Modal.Header closeButton>
                    <Modal.Title>Menu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex">
                        <AccountCircle sx={{ fontSize: 80 }}/>
                        <div className="ms-5">
                            <h1> {(biciusuario !== undefined) ? biciusuario.userName : ''} </h1>
                            <p> { (biciusuario !== undefined) ? biciusuario.correo : ''} </p>
                        </div>
                    </div>
                    <Paper className="ps-1 pe-1
                    " sx={{maxHeight: '200px', overflow: 'auto', borderColor: 'grey.500', borderStyle: 'solid', borderWidth: '0.1em'}}>
                        { 
                        (Boolean(bicicletas) && (bicicletas.length > 0)) ?
                            bicicletas.map((bicicleta) =>
                            <>
                                {(bicicleta.robada) ? (
                                <Box className="align-items-center mt-1 mb-1" sx={{ backgroundColor:"#dedad9", color:"#A75858" , display:"flex", justifyContent: 'space-between', borderColor: 'grey.500', borderStyle: 'solid', borderWidth: '0.1em', borderRadius: '12px' }}>
                                    <div className="ms-3">
                                        <PedalBike sx={{fontSize: 32 }}/>
                                    </div>
                                    <div className="mt-2 mb-2">
                                        <p className="mb-0 fw-bold">{bicicleta.modelo}</p>
                                        <p className="mt-0 mb-0">{bicicleta.color}</p>
                                    </div>
                                    <div className="d-flex me-3">
                                        <IconButton className="ms-1" onClick={ () => {handleOpenDialog(); setSerie(bicicleta.serie); }}><Delete sx={{ fontSize: 20, color: "#A75858" }}/></IconButton>
                                    </div>
                                </Box>
                                ) : (
                                <Box className="align-items-center mt-1 mb-1" sx={{ display:"flex", justifyContent: 'space-between', borderColor: 'grey.500', borderStyle: 'solid', borderWidth: '0.1em', borderRadius: '12px' }}>
                                    <div className="ms-3">
                                        <PedalBike sx={{fontSize: 32 }}/>
                                    </div>
                                    <div className="mt-2 mb-2">
                                        <p className="mb-0 fw-bold">{bicicleta.modelo}</p>
                                        <p className="mt-0 mb-0">{bicicleta.color}</p>
                                    </div>
                                    <div className="d-flex me-3">
                                        <IconButton onClick={() => {
                                            setBicicleta(bicicleta)
                                            handleOpenReportDialog();
                                        }}><Report sx={{ fontSize: 20 }}/></IconButton>
                                        <IconButton className="ms-1" onClick={ () => {handleOpenDialog(); setSerie(bicicleta.serie); }}><Delete sx={{ fontSize: 20, color: "#A75858" }}/></IconButton>
                                    </div>
                                </Box>)}
                                
                            </>
                            )
                                
                        : 
                            <Box  className="align-items-center mt-1 mb-1" sx={{display:"flex", justifyContent: 'space-between', borderColor: 'grey.500', borderStyle: 'solid', borderWidth: '0.1em', borderRadius: '12px' }}>
                                <div className="ms-3">
                                    <PedalBike sx={{fontSize: 32}}/>
                                </div>
                                <div className="mt-2 mb-2">
                                    <p className="mb-0 fw-bold">No has registrado ninguna bicicleta</p>
                                </div>
                                <div></div>
                            </Box>
                        }
                    </Paper>
                    <br/>
                    <div className="d-flex justify-content-around">
                        <Nav.Link as={Link} to="/regBicicleta">
                            <Button className="botones_aplicacion" size="small" onClick={handleCloseModalMenu}>
                                Añadir Bicicleta
                                <IconButton aria-label="LogOut">
                                    <Add sx={{ color: "#262626" }}/>
                                </IconButton>
                            </Button>
                        </Nav.Link>
                        <Button className="botones_aplicacion_rojos" size="small" onClick={cerrarSesion}>
                            Cerrar Sesión
                            <IconButton aria-label="LogOut">
                                <LogoutOutlined sx={{ color: "#262626" }}/>
                            </IconButton>
                        </Button>
                    </div>

                </Modal.Body>
            </Modal>

            <Modal show={showModalLogin} onHide={handleCloseLoginModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Login</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Formik
                        initialValues={{correo:"", contrasena:""}}
                        onSubmit={async (values) => {
                            var cookie = new Cookies();
                            API.post("/biciusuarios/save/login", values).then(({data}) => {
                                if(Boolean(data)){
                                    setBiciusuario(data);
                                    SetLoggeado(true);
                                    setBiciusuario(data);
                                    handleCloseLoginModal();
                                    cookie.set("logged", true, { path: '/' });
                                    cookie.set("bcusuario", data, { path: '/' });

                                    var path = "/bicicletas/select/all/"+data.ident;
                                    API.get(path).then(({data}) =>{
                                        if(Boolean(data)){
                                            cookie.set("bicicletas", data, {path: '/'});
                                            setBicicletas(data);
                                        }
                                    })
                                    
                                    setMessage("Bienvenido");
                                    setSucces(true);
                                }
                                else{
                                    setMessage("Correo o contraseña incorrectas");
                                    setError(true);
                                    console.log(data);
                                }
                            });
                            setSucces(false);
                            setError(false);

                        }}
                        validationSchema = {validationSchema}>
                        {({handleChange,handleSubmit,errors}) => (
                            <>
                            <Paper>
                                <Container>
                                    <Row className="justify-content-md-center">
                                        <Col md="auto">
                                            <div>
                                                <TextField
                                                 required
                                                 label="Correo"
                                                 onChange={handleChange('correo')}
                                                 error={errors.correo ? true : false}
                                                 sx={{ m: 1, width: '25ch' }}/>
                                                <Typography variant="inherit" color="textSecondary">
                                                    {errors.correo}
                                                </Typography>
                                            </div>
                                        </Col>
                                    </Row>
                                    <br />
                                    <Row className="justify-content-md-center">
                                        <Col md="auto">
                                            <div>
                                                <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                                                    <InputLabel htmlFor="outlined-adornment-password">Contraseña</InputLabel>
                                                    <OutlinedInput
                                                        type={showPassword ? 'text' : 'password'}
                                                        endAdornment={
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    aria-label="toggle password visibility"
                                                                    onClick={handleShowPassword}
                                                                    onMouseDown={handleDontShowPassword}
                                                                    edge="end"
                                                                >
                                                                    {showPassword ? <VisibilityOff /> : <Visibility />} 
                                                                </IconButton>
                                                            </InputAdornment>
                                                        }
                                                        onChange={handleChange('contrasena')}
                                                        error={errors.contrasena ? true : false}
                                                        label="Contraseña"/>
                                                </FormControl>
                                                <Typography variant="inherit" color="textSecondary">
                                                    {errors.contrasena}
                                                </Typography>
                                            </div>
                                        </Col>
                                    </Row>
                                    <br />
                                    <Row className="justify-content-md-center">
                                        <Button onClick={handleSubmit} className="botones_aplicacion">
                                            INGRESAR
                                        </Button> 
                                    </Row>
                                </Container>
                            </Paper>
                            </>
                        )}
                    </Formik>
                </Modal.Body>
                <Modal.Footer>
                    <Container>
                        <Row className="justify-content-md-center">
                            <Col md="auto">
                                <Nav.Link as={Link} to="/login" onClick={handleCloseLoginModal}><p><a href="/">¿Olvidaste tu contraseña?</a></p></Nav.Link>
                            </Col>
                        </Row>
                        <br />
                        <Row className="justify-content-md-center">
                            <Col md="auto">
                                <Nav.Link as={Link} to="/register" onClick={handleCloseLoginModal}><p><a href="/">Registrarse</a></p></Nav.Link>
                            </Col>
                        </Row>
                    </Container>
                    
                </Modal.Footer>
            </Modal>

            <section>
                <Outlet></Outlet>
            </section>
        </>
    );
}

export default NavbarExample;