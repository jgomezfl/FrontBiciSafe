export function until(promise){
    if(!promise){
        console.error("No se encontró ninguna promesa", promise);
        return Promise.reject([null, null]);
    }

    //arreglo de promesas
    if(Array.isArray(promise)){
        return Promise.all(promise)
            .then((results) => [null, results])
            .catch((err) => [err, promise.map(() => undefined)]);
    }

    //Objeto único
    return promise
        .then((result) => [null, result])
        .catch((err) => [err, undefined]);
    
}