import express from 'express';

const app = express();
const port = 3000;

app.get('/location', async (req, res) => {
    console.log('receiving')
    const postcode = req.query.postcode

    const address = req.query.address
    const addressNumber = req.query.addressNumber
    const queryAdressNumber = addressNumber ? '%20and%20' + addressNumber : ''
    const queryAdress = address ? '%20and%20' + address : ''
    console.log(queryAdressNumber)
    console.log(queryAdress)
    const response = await fetch('https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=' + postcode + queryAdress +queryAdressNumber + '&fl=id%20identificatie%20weergavenaam%20bron%20type%20openbareruimte_id%20nwb_id%20openbareruimtetype%20straatnaam%20straatnaam_verkort%20adresseerbaarobject_id%20nummeraanduiding_id%20huisnummer%20huisletter%20huisnummertoevoeging%20huis_nlt%20postcode%20buurtnaam%20buurtcode%20wijknaam%20wijkcode%20woonplaatscode%20woonplaatsnaam%20gemeentecode%20gemeentenaam%20provinciecode%20provincienaam%20provincieafkorting%20kadastrale_gemeentecode%20kadastrale_gemeentenaam%20kadastrale_sectie%20perceelnummer%20kadastrale_grootte%20gekoppeld_perceel%20kadastrale_aanduiding%20volgnummer%20gekoppeld_appartement%20wegnummer%20hectometernummer%20zijde%20hectometerletter%20waterschapsnaam%20waterschapscode%20rdf_seealso%20centroide_ll%20centroide_rd%20score&fq=type%3A%28adres%29&df=tekst&bq=type%3Aprovincie%5E1.5&bq=type%3Agemeente%5E1.5&bq=type%3Awoonplaats%5E1.5&bq=type%3Aweg%5E1.5&bq=type%3Apostcode%5E0.5&bq=type%3Aadres%5E1&start=0&rows=10&sort=score%20desc%2Csortering%20asc%2Cweergavenaam%20asc&wt=json'
    );
    //extract JSON from the http response
    if (response.ok) {
        let jsonPdok = await response.json();
        console.log(jsonPdok);
        let centroideLl = jsonPdok.response.docs[0].centroide_ll;
        let converted1 =centroideLl.replace("POINT(", "")
        converted1 =converted1.replace(")", "")
        const coords: string[] = converted1.split(" ")
        const jsonResponse = {
            x : coords[0],
            y : coords[1]
        }
        res.send(jsonResponse)
    }else{

    }
    res.send(response.statusText)
});

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});
