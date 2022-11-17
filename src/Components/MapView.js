import React from 'react';
import { GoogleMap, Marker, useLoadScript, InfoWindow } from '@react-google-maps/api';

import { Card, CardContent, CardHeader, IconButton, MenuItem } from "@mui/material";
import { Box, FormControl, Select, InputLabel } from '@mui/material';
import { PedalBike, CarCrash, Star, StarBorder } from '@mui/icons-material';
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Button } from 'react-bootstrap';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { 
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxOption,
} from '@reach/combobox';
import "@reach/combobox/styles.css";
import Cookies from "universal-cookie";
import API from "../services/http-common";
import { SuccessMessage,InstantMessage } from "../Helpers/Alertas";
import { Link } from 'react-router-dom';
var cookie = new Cookies();

const options = {
  disableDefaultUI: true,
  zoomControl: true,
  
};

export default function MapView(){
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyCfbBDrs9hnIyTyatEiugtITNbvfNBxpUc",
    libraries: ["places"],
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
  

  const [lugares, setLugares] = React.useState([]);
  const [selectedLugar, setSelectedLugar] = React.useState(null);
  const [calificacion, setCalificacion] = React.useState(null);
  const [auxCalificacion, setAuxCalificacion] = React.useState(null);
  const [calificarReporte, setCalificarReporte] = React.useState([{id: 0, value: false},{id: 1, value: false},{id: 2, value: false},{id: 3, value: false},{id: 4, value: false}]);
  const [reportes, setReportes] = React.useState([]);
  const [selectedReporte, setSelectedReporte] = React.useState(null);
  const [tipoLugar, setTipoLugar] = React.useState(null);
  const [center, setCenter] = React.useState({ lat: 43.45, lng:-80.49 });
  const [selected, setSelected] = React.useState(null);
  const [marker, setMarker] = React.useState(null);
  const [selectedMarker, setSelectedMarker] = React.useState(null);

  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, [])
  const panTo = React.useCallback(({lat, lng}) => {
    mapRef.current.panTo({lat, lng});
    mapRef.current.setZoom(14);
  }, []);

  const [openDialog, setOpenDialog] = React.useState(false);
  const handleOpenDialog = () => { setOpenDialog(true); };
  const handleCloseDialog = () => { setOpenDialog(false); };

  const [ openReportDialog, setOpenReportDialog ] = React.useState(false);
  const handleOpenReportDialog = () => { setOpenReportDialog(true) };
  const handleCloseReportDialog = () => { setOpenReportDialog(false) };

  const [openCalificacionDialog, setOpenCalificacionDialog] = React.useState(null);
  const handleOpenCalificacionDialog = () => { setOpenCalificacionDialog(true); };
  const handleCloseCalificacionDialog = () => { setOpenCalificacionDialog(false); }

  React.useState(() => {
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        position => {
          console.log(position.coords)
          setCenter({lat:position.coords.latitude, lng:position.coords.longitude});
        }
      )
    }
    if(biciusuario){
      var path = "/lugares/select/"+biciusuario.ident;
      API.get(path).then(({data}) => {
        var aux = [];
        for(var i in data){
          aux.push(data[i]);
        }
        setLugares(aux);
      })
    }
    API.get("/reportes/select/all").then(({data}) => {
      if(Boolean(data)){
        var aux = [];
        for (var i in data){
          if(data[i].serie === null){aux.push(data[i])}
        }
        setReportes(aux)
      }
    });
    setInterval(() => {
      API.get("/reportes/select/all").then(({data}) => {
        if(Boolean(data)){
          var aux = []
          for (var i in data){
            if(data[i].serie === null){aux.push(data[i])}
          }
          setReportes(aux)
        }
      });
      var path = "/lugares/select/"+biciusuario.ident
      API.get(path).then(({data}) => {
        setLugares(data);
      });
    }, 20000);
  });

  return (
    <>
      <div className='places-container'>
        <PlacesAutocomplete setSelected={setSelected} panTo={panTo} />
      </div>

      <GoogleMap
       zoom={15}
       center={center}
       mapContainerClassName="map-container"
       options={options}
       onClick={(event) => {
        setMarker(
          {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
            time: new Date(),
          }
        );
        setSelectedMarker(null);
       }}
       onLoad={onMapLoad}
      >
        {lugares.map((lugar) => (
          <>
            {(lugar.tipo==="Home") ? <Marker key={lugar.id} position={{lat: parseFloat(lugar.latitud), lng: parseFloat(lugar.longitud)}} 
            icon={{url: '/HomeIcon.png'}} onClick={() => {
              var dict = {lat: parseFloat(lugar.latitud), lng: parseFloat(lugar.longitud)}
              setSelectedLugar(dict)
              console.log(selectedLugar)
            }}/> : ''}
            {(lugar.tipo==="School") ? <Marker key={lugar.id} position={{lat: parseFloat(lugar.latitud), lng: parseFloat(lugar.longitud)}} 
            icon={{url: '/SchoolIcon.png'}} onClick={() => {
              var dict = {lat: parseFloat(lugar.latitud), lng: parseFloat(lugar.longitud)}
              setSelectedLugar(dict)
              console.log(selectedLugar)
            }}/> : ''}
            {(lugar.tipo==="Work") ? <Marker key={lugar.id} position={{lat: parseFloat(lugar.latitud), lng: parseFloat(lugar.longitud)}} 
            icon={{url: '/WorkIcon.png'}}/> : ''}
            {(lugar.tipo==="Another") ? <Marker key={lugar.id} position={{lat: parseFloat(lugar.latitud), lng: parseFloat(lugar.longitud)}} 
            icon={{url: '/BikeIcon.png'}} onClick={() => {
              var dict = {lat: parseFloat(lugar.latitud), lng: parseFloat(lugar.longitud)}
              setSelectedLugar(dict)
              console.log(selectedLugar)
            }}/> : ''}
          </>
        ))}
        {reportes.map((reporte) => (
          <>
            {(reporte.tipo==="Crash") ? <Marker key={reporte.id} position={{lat: parseFloat(reporte.latitud), lng: parseFloat(reporte.longitud)}}
            icon={{url: 'CrashIcon.png'}} onClick={() => {
              API.get("/calificaciones/select/calificacion/"+reporte.id).then(({data}) => {
                setCalificacion(data);
                console.log(data);
              })
              setTimeout(() => {setSelectedReporte(reporte);}, 2000);
              
              }}/>: ''}
            {(reporte.tipo==="Robber") ? <Marker key={reporte.id} position={{lat: parseFloat(reporte.latitud), lng: parseFloat(reporte.longitud)}}
            icon={{url: 'RobberIcon.png', scaledSize: new window.google.maps.Size(30, 30)}} onClick={() => {
              API.get("/calificaciones/select/calificacion/"+reporte.id).then(({data}) => {
                setCalificacion(data)
              })
              setTimeout(() => {setSelectedReporte(reporte);}, 2000);
              }}/>: ''}
          </>
        ))}
        {selected && <Marker key={"Found"} position={selected} 
        onClick={() => {
          setSelectedMarker(selected);
          setBiciusuario(cookie.get("bcusuario"));
        }}/>}
        {marker && <Marker key={marker.time.toISOString()} position={{lat: marker.lat, lng: marker.lng}}
          onClick={() => {
            setSelectedMarker(marker);
            setBiciusuario(cookie.get("bcusuario"));
          }}
        />}
        {selectedMarker && (
          <InfoWindow
           onCloseClick={() => {
            setSelectedMarker(null);
           }}
           position={{
            lat: parseFloat(selectedMarker.lat),
            lng: parseFloat(selectedMarker.lng)
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
              subheader="¿Qué deseas hacer?"
              />
              <CardContent>
                <div className="d-flex align-items-center flex-column">
                  <Link to="/ruta"  state={{LatDestino: parseFloat(selectedMarker.lat), LngDestino: parseFloat(selectedMarker.lng)}}>
                    <Button className="botones_aplicacion" size="small">Ir</Button>
                  </Link>
                  <br/>
                  <Button className="botones_aplicacion" size="small" onClick={handleOpenDialog}>Guardar</Button>
                  <br/>
                  <Button className="botones_aplicacion_rojos" size="small" onClick={handleOpenReportDialog}>Reportar</Button>
                </div>
              </CardContent>
            </Card>
          </InfoWindow>
        )}
        {selectedLugar && (
          <InfoWindow
           onCloseClick={() => {
            setSelectedLugar(null);
           }}
           position={{
            lat: selectedLugar.lat,
            lng: selectedLugar.lng
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
               subheader="¿Qué deseas hacer?"
              />
              <CardContent>
                <div className="d-flex align-items-center flex-column">
                  <Link to="/ruta"  state={{LatDestino: parseFloat(selectedLugar.lat), LngDestino: parseFloat(selectedLugar.lng)}}>
                    <Button className="botones_aplicacion" size="small">Ir</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </InfoWindow>          
        )}
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
      </GoogleMap>

      <Dialog
       open={openDialog}
       onClose={handleCloseDialog}
       aria-labelledby="alert-dialog-title"
       aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title" className='d-flex align-items-center'>
          <PedalBike/>
          <div className='d-flex ms-5'>¿Estas seguro de guardar este lugar?</div>
        </DialogTitle>
        <DialogContent>
          {(biciusuario) ? (
            <DialogContent id ="alert-dialog-description">
              Por favor Ingresa la información solicitada y confirma el envío de datos.
              <Box sx={{display:"flex", flexWrap:'wrap', justifyContent: 'space-around'}}>
                <div>
                  <FormControl className='mt-5' sx={{ m: 1, width: '25ch' }} variant="outlined">
                    <InputLabel>Tipo de Lugar</InputLabel>
                    <Select
                     required
                     label="Tipo de Lugar"
                     onChange={(event) => { setTipoLugar(event.target.value) }}>
                      <MenuItem value={"Home"}>Hogar</MenuItem>
                      <MenuItem value={"Work"}>Trabajo</MenuItem>
                      <MenuItem value={"School"}>Escuela</MenuItem>
                      <MenuItem value={"Another"}>Otro</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </Box>
            </DialogContent>
          ) : (
            <DialogContent id ="alert-dialog-description">
              Usuario no esta loggeado, no puedes acceder a esta función
            </DialogContent>
          )}
        </DialogContent>
        <DialogActions>
          <Button className="btn btn-danger" onClick={handleCloseDialog}>
            Cancelar
          </Button>
          {(biciusuario) ? (
          <Button className="btn btn-success" onClick={() => {
            if(tipoLugar === "Home" || tipoLugar === "Work" || tipoLugar === "School" || tipoLugar === "Another"){
              var dict = {
                ident: biciusuario.ident,
                tipo: tipoLugar,
                latitud: selectedMarker.lat,
                longitud: selectedMarker.lng,
              }
              API.post("/lugares/save", dict).then(({data}) => {
                console.log(data);
                lugares.push(dict);
                setMarker(null);
                handleCloseDialog();
              })
            }
          }}>
            Guardar
          </Button>
          ) : ''}
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
                latitud: selectedMarker.lat,
                longitud: selectedMarker.lng,
                calificacion: 0.0,
                cantidadCalificaciones: 0,
              }
              API.post("/reportes/save",dict).then(({data}) => {
                console.log(data);
                reportes.push(dict)
                handleCloseReportDialog();
                setMarker(null)
              })
            }
          }}>Reportar</Button>
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
                  calificacion: auxCalificacion+1,
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

      {success ? <SuccessMessage message = {message}/> : `` }
      {error ? <InstantMessage message = {message}/> : `` }
    </>
  );
}

const PlacesAutocomplete = ({ setSelected, panTo }) => {
  const{
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => 43.45, lng:  () =>  -80.49 },
      radius: 200 * 1000,
    },
  });

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    const result = await getGeocode({ address });
    const { lat, lng } = await getLatLng(result[0]);
    setSelected({ lat, lng });
    panTo({lat, lng});
  };

  return (
    <Combobox onSelect={handleSelect}>
      <ComboboxInput value={value} onChange={e => setValue(e.target.value)} disabled={!ready} 
      className="combobox-input" placeholder='Busca una dirección'/>
      <ComboboxPopover>
          {status === "OK" && data.map(({place_id, description}) => (
            <ComboboxOption key={place_id} value={description} />
          ))}
      </ComboboxPopover>
    </Combobox>
  );
};