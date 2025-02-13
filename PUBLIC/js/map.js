       mapboxgl.accessToken = mapboxToken;
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v9',
         
            zoom: 9,
            center: list.geometry.coordinates,
        });  
        console.log(list);
        const marker1 = new mapboxgl.Marker({color:"red"})
        .setLngLat(list.geometry.coordinates)
        .setPopup(new mapboxgl.Popup({offset: 25})
        
        .setHTML(`<h1>${list.title}!</h1><p>exact location will be provided after booking`)
        .setMaxWidth("300px"))
        .addTo(map);