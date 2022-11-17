import { GoogleMap, Marker, DirectionsRenderer, useLoadScript, InfoWindow } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, IconButton, MenuItem } from "@mui/material";
import React from 'react';
import { Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { MyLocation, PedalBike, CarCrash, Star, StarBorder } from '@mui/icons-material';
import { Box, FormControl, Select, InputLabel } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import API from '../services/http-common';
import { SuccessMessage,InstantMessage } from "../Helpers/Alertas";
import Cookies from "universal-cookie";
var cookie = new Cookies();


export default function Ruta() {

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyCfbBDrs9hnIyTyatEiugtITNbvfNBxpUc",
    libraries: ["places","drawing","geometry","visualization","localContext"],
  });
  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading Maps";
  return <Map />;
}

function Map() {

  const [biciusuario, setBiciusuario] = React.useState(cookie.get("bcusuario"));
  const [error, setError] = React.useState(false);
  const [success, setSucces] = React.useState(false);
  const [message, setMessage] = React.useState(null);

  const [viaje, setViaje] = React.useState(false);
  const [info, setInfo] = React.useState(null);
  const [calificacion, setCalificacion] = React.useState(null);
  const [calificarReporte, setCalificarReporte] = React.useState([{id: 0, value: false},{id: 1, value: false},{id: 2, value: false},{id: 3, value: false},{id: 4, value: false}]);
  const [auxCalificacion, setAuxCalificacion] = React.useState(null);
  const [selectedReporte, setSelectedReporte] = React.useState(null);
  const [reportes, setReportes] = React.useState([]);
  const [finalViaje, setFinalViaje] = React.useState(false)
  const [directions, setDirections] = React.useState(null);
  const [markerPos, setMarkerPos] = React.useState(null);
  const [centerMarker, setCenterMarker] = React.useState(null);
  const [currentLocation, setCurrentLocation] = React.useState(null);
  const [tipoLugar, setTipoLugar] = React.useState(null);

  const [openCalificacionDialog, setOpenCalificacionDialog] = React.useState(null);
  const handleOpenCalificacionDialog = () => { setOpenCalificacionDialog(true); };
  const handleCloseCalificacionDialog = () => { setOpenCalificacionDialog(false); }

  const [ openReportDialog, setOpenReportDialog ] = React.useState(false);
  const handleOpenReportDialog = () => { setOpenReportDialog(true) };
  const handleCloseReportDialog = () => { setOpenReportDialog(false) };

  const navigate = useNavigate();

  const location = useLocation();

  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map
  }, []);
  const panTo = React.useCallback(() => {
    navigator?.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        const pos = { lat, lng }
        setCurrentLocation(pos);
        setCenterMarker(pos);
        mapRef.current.panTo(pos);
        mapRef.current.setZoom(18);
      }
    )
  },[]);

  React.useState(() => {
    navigator?.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        const pos = { lat, lng }
        setCurrentLocation(pos);
        setCenterMarker(pos);
        console.log(location.state);
        setMarkerPos({lat: location.state.LatDestino, lng: location.state.LngDestino})
      }
    )
    API.get("/reportes/select/all").then(({data}) => {
      if(Boolean(data)){
        var aux = []
        for (var i in data){
          if(data[i].serie === null){aux.push(data[i])}
        }
        setReportes(aux)
      }
    });
    const intervalReportes = setInterval(() => {
      API.get("/reportes/select/all").then(({data}) => {
        if(Boolean(data)){
          var aux = []
          for (var i in data){
            if(data[i].serie === null){aux.push(data[i])}
          }
          setReportes(aux)
        }
      });
    }, 20000);
  });

  const getDirections = () => {
    setViaje(true);
    const directionsService = new window.google.maps.DirectionsService();

    var origin = currentLocation;
      var destination = markerPos;
  
      if (origin !== null && destination !== null) {
        directionsService.route(
          {
            origin: origin,
            destination: destination,
            travelMode: window.google.maps.TravelMode.WALKING
          },
          (result, status) => {
            if(status === window.google.maps.DirectionsStatus.OK){
              setDirections(result)
              var distance = result.routes[0].legs[0].distance.text.split(" ");
              if(parseFloat(distance[0])<20 && distance[1]==="m"){
                clearInterval(interval)
                setFinalViaje(true);
              }
            } else {
              console.error(`error fetching directions ${result}`);
            }
          }
        );
      } else {
        console.log('Please mark your destination in the map first!');
      }
    
    const interval = setInterval(() => {

      var origin = currentLocation;
      var destination = markerPos;

      const directionsService = new window.google.maps.DirectionsService();

      navigator?.geolocation.getCurrentPosition(
        ({ coords: { latitude: lat, longitude: lng } }) => {
          const pos = { lat, lng }
          origin = pos;
          setCurrentLocation(pos);
          setCenterMarker(pos);
        }
      )

      
  
      if (origin !== null && destination !== null) {
        directionsService.route(
          {
            origin: origin,
            destination: destination,
            travelMode: window.google.maps.TravelMode.WALKING
          },
          (result, status) => {
            if(status === window.google.maps.DirectionsStatus.OK){
              setDirections(result)
              var distance = result.routes[0].legs[0].distance.text.split(" ");
              if(parseFloat(distance[0])<20 && distance[1]==="m"){
                clearInterval(interval);
                setFinalViaje(true);
              }
            } else {
              console.error(`error fetching directions ${result}`);
            }
          }
        );
      } else {
        console.log('Please mark your destination in the map first!');
      }
    }, 10000);

  };

  return(
    <>
      <div className='location-container'>
        <IconButton onClick={panTo}>
          <MyLocation />
        </IconButton>
      </div>

      {(!viaje) ? (
        <div className='places-container'>
          <Button className='botones_aplicacion' onClick={getDirections}>Iniciar Viaje</Button>
        </div>
      ) : null}
      
      <GoogleMap
       zoom={17}
       center={currentLocation}
       mapContainerClassName="map-container"
       defaultCenter={{ lat: 40.756795, lng: -73.954298 }}
       options = {{
        disableDefaultUI: true,
        zoomControl: true
       }}
       onClick={(event) => {
        setInfo(
          {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          }
        )
       }}
       onLoad={onMapLoad}
      >
        {(centerMarker !== null) && (
          <Marker position={centerMarker} icon={{url: '/LocationIcon.png'}} />
        )}
        {(markerPos !== null) && (
          <Marker position={markerPos}  />
        )}
        {(directions !== null) && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true
            }}
          />
        )}

        {reportes.map((reporte) => (
          <>
            {(reporte.tipo==="Crash") ? <Marker key={reporte.id} position={{lat: parseFloat(reporte.latitud), lng: parseFloat(reporte.longitud)}}
            icon={{url: 'CrashIcon.png'}} onClick={() => {
              API.get("/calificaciones/select/calificacion/"+reporte.id).then(({data}) => {
                setCalificacion(data);
                console.log(data);
              })
              setTimeout(() => {setSelectedReporte(reporte);}, 3000);
              
              }}/>: ''}
            {(reporte.tipo==="Robber") ? <Marker key={reporte.id} position={{lat: parseFloat(reporte.latitud), lng: parseFloat(reporte.longitud)}}
            icon={{url: 'RobberIcon.png'}} onClick={() => {
              API.get("/calificaciones/select/calificacion/"+reporte.id).then(({data}) => {
                setCalificacion(data)
              })
              setTimeout(() => {setSelectedReporte(reporte);}, 3000);
              }}/>: ''}
          </>
        ))}

        {selectedReporte && (
          <InfoWindow
           onCloseClick={() =>{
            setSelectedReporte(null);
           }}
           position={{
            lat: parseFloat(selectedReporte.latitud),
            lng: parseFloat(selectedReporte.longitud),
           }}>
            <Card>
              <CardHeader
              avatar={
                <IconButton aria-label="secondaryIcon">
                  <CarCrash/>
                </IconButton>
              }
              title="REPORTE"
              subheader="Problemas en las calles"
              />
              <CardContent>
                <>
                  <div className='d-flex justify-content-around'>
                    {calificacion.map((cal) => (
                      <>
                        {cal ? (<Star/>) : null}
                        {(!cal) ? (<StarBorder/>) : null}
                      </>
                    ))}
                  </div>
                  <br/>
                  <p className='mt-1' style={{color: 'blue', textDecoration: 'underline', cursor: "pointer"}} onClick={handleOpenCalificacionDialog}>Calificar</p>
                </>
              </CardContent>
            </Card>
          </InfoWindow>
        )}

        {info && (
          <InfoWindow
           onCloseClick={() => {
            setInfo(null);
           }}
           position={{
            lat: info.lat,
            lng: info.lng
           }}
          >
            <Card>
              <CardHeader
              avatar={
                <IconButton aria-label="secondaryIcon">
                  <PedalBike/>
                </IconButton>
              }
              title="LUGAR"
              subheader="¿Deseas hacer un reporte?"
              />
              <CardContent>
                <div className="d-flex align-items-center flex-column">
                  <Button className="botones_aplicacion_rojos" size="small" onClick={handleOpenReportDialog}>Reportar</Button>
                </div>
              </CardContent>
            </Card>
          </InfoWindow>
        )}

      </GoogleMap>

      <Dialog
       open={finalViaje}>
        <DialogTitle id="alert-dialog-title" className='d-flex align-items-center'>
          <PedalBike/>
          <div className='d-flex ms-5'>Esperamos tu viaje fuese plasentero</div>
        </DialogTitle>
        <DialogActions>
          <Button className='btn btn-success' onClick={() => {
            navigate(("/"));
          }}>Terminar</Button>
        </DialogActions>
      </Dialog>

      <Dialog
       open={openCalificacionDialog}
       onClose={handleCloseCalificacionDialog}>
        <DialogTitle>
          <div className='d-flex justify-content-around align-items-center'><PedalBike/>¿Como calificarias este reporte?</div>
        </DialogTitle>
        <DialogContent>
          <div className='mt-2 mb-2'>¿Ha sido de útilidad este reporte para planear tu viaje?</div>
          <Box sx={{display:"flex", flexWrap:"wrap", justifyContent:"space-around" }}>
            {calificarReporte.map((cal) => (
              <>
                {(cal.value) ? (<IconButton onMouseLeave={() => {
                  var aux = [];
                  for (var i = 0 ; i < 5 ; i++){
                    if(auxCalificacion !== null && i<=auxCalificacion){
                      aux.push({id: i, value: true});
                    } else{
                      aux.push({id: i, value: false});
                    }
                  }
                  setCalificarReporte(aux);
                }} onClick={() => {
                  setAuxCalificacion(cal.id)
                }}><Star /></IconButton>) : null}
                {(!cal.value) ? (<IconButton
                 onMouseOver={() => {
                  var aux = [];
                  for (var i  = 0 ; i < 5 ; i++){
                    if(i <= cal.id){
                      aux.push({id: i, value: true});
                    } else{
                      aux.push({id: i, value: false});
                    }
                  }
                  setCalificarReporte(aux);
                 }}><StarBorder /></IconButton>) : null}
              </>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button className='btn btn-danger' onClick={() => {
            handleCloseCalificacionDialog();

            setTimeout(() => {
              setAuxCalificacion(null);
            }, 2000);
          }}>Cancelar</Button>
          <Button className='btn btn-success' onClick={() => {
            setBiciusuario(cookie.get("bcusuario"));
            if(!biciusuario){
              setMessage("No puedes calificar sin iniciar sesión");
              setError(true);
            }
            else{
              if(auxCalificacion+1){
                var dict = {
                  reporteId: selectedReporte.id,
                  ident: biciusuario.ident,
                  calificacion: auxCalificacion,
                }
                API.post("/calificaciones/save", dict).then(({data}) => {
                  if (data !== "Success"){
                    setMessage(data);
                    setError(true);
                  }
                  else{
                    setMessage("Calificación almacenada");
                    setSucces(true);
                    handleCloseCalificacionDialog();
                    setSelectedReporte(null);
                  }
                })
              }
              else{
                setMessage("No seleccionaste ninguna estrella");
                setError(true);
              }
            }
            setTimeout(() => {
              setError(false);
              setSucces(false);
            }, 3000);
          }}>Calificar</Button>
        </DialogActions>
      </Dialog>

      <Dialog
       open={openReportDialog}
       onClose={handleCloseReportDialog}
       aria-labelledby="alert-dialog-title"
       aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title" className="d-flex align-items-center">
          
          <div className='d-flex justify-content-around'><PedalBike />¿Qué deseas reportar?</div>
        </DialogTitle>
        <DialogContent id ="alert-dialog-description">
          Por favor ingresa el motivo de tu reporte y confirmalo.
          <Box sx={{display:"flex", flexWrap:"wrap", justifyContent:"space-around" }}>
            <div>
              <FormControl className="mt-5" sx={{ m: 1, width: '25ch' }} variant="outlined">
                <InputLabel>Motivo del Reporte</InputLabel>
                <Select
                 required
                 label="Motivo del Reporte"
                 onChange={(event) => { setTipoLugar(event.target.value) }}>
                  <MenuItem value={"Crash"}>Choque en la vía</MenuItem>
                  <MenuItem value={"Robber"}>Siniestro</MenuItem>
                </Select>
              </FormControl>
            </div>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button className='btn btn-danger' onClick={handleCloseReportDialog}>Cancelar</Button>
          <Button className='btn btn-success' onClick={() => {
            if(tipoLugar === "Crash" || tipoLugar === "Robber"){
              var aux = null;
              if(biciusuario){
                aux = biciusuario.ident;
              }
              var dict = {
                ident: aux,
                tipo: tipoLugar,
                latitud: info.lat,
                longitud: info.lng,
                calificacion: 0.0,
                cantidadCalificaciones: 0,
              }
              API.post("/reportes/save",dict).then(({data}) => {
                console.log(data);
                reportes.push(dict)
                handleCloseReportDialog();
              })
            }
          }}>Reportar</Button>
        </DialogActions>
      </Dialog>

      {success ? <SuccessMessage message = {message}/> : `` }
      {error ? <InstantMessage message = {message}/> : `` }

    </>
  );

}