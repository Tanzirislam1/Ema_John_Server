const express = require('express');
const app = express();
const cors = require('cors');
/* amra .env use korle ai dotenv k require korte hbe nh hole amra data gulo k server side e access korte parbo nh... */
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleWare
// 1. cors: amra server side k client er shate add korte gale cors() tah k import kore middle ware er moddhe call korte hoy nh hole 2ta port er connection er moddhe problem hoy...
// 2. express.json : amra req er body theke jei data pai sheita json akare thake oi data tah k parse kore dae ai kajta korte amra app.use() er moddhe express k json e convert kori...
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ifuw28m.mongodb.net/?retryWrites=true&w=majority`;
/* jodi error dae tahole amra uri k console korbo bad auth */
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("emaJohn").collection("product");
//   console.log('Mongo is Connected');
//   // perform actions on the collection object
//   client.close();
// });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db("emaJohn").collection("product");

        app.get('/product', async (req, res) => {
            /* amra req.query k console kore client theke page and size 2ta value k terminal e dekhtase and amra client side e pagination button e hit kortase oita aikhane req.query er moddhe ashatese karon amra shop.js e fetch kortase search query kore dynamic vabe data load kortase and query set kortase page and size diye and dependency set kore ditase amra jokhon pagination button a hit kori tokhon page and size er value server terminal e dekhtase req.query k console kore...amra req.query.page diye page k and req.query.size diye amra page and size 2 ta value k nitase aigula string tai amra parseInt() kortase...amra page er moddhe abar product koyta kore show korbe ter count tao  set kore dise...terpor query nitase and cursor er moddhe data gulo k access kortase find() kore terpor amra condition ditase if() jodi page and size hoy tahole cursor theke skip() set korbo amra skip korbo kokhon 1 page a skip korbo nh 0 theke 10 thakbe terpor 2nd page e 1-10 skip korbo amra skip er moddhe page*size kortase then skip theke limit() set korbo limit er moddhe amra amader size jeita sheita k limit er moddhe set kore dibo else{} jodi page and size jodi nh thake tahole cursor k toArray() tae set kore dibo... */
            console.log('query', req.query);
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const query = {};
            const cursor = productCollection.find(query);
            let products;
            if(page || size){
                /* page 0 bolte bujhay amra kono skip hbe nh kinto amra 0-10 porjonto data pabo...
                * page-0 hole => 0 ---> skip:0 get: 0-10 (10)
                * page-1 hole => 1 ---> skip:1*10 get: 11-20 (10)
                * page-2 hole => 2 ---> skip:2*10 get: 21-30 (10)
                * * page-3 hole => 3 ---> skip:3*10 get: 31-40 (10)
                */
                products = await cursor.skip(page*size).limit(size).toArray();
            }
            else{
                products = await cursor.toArray();
            }
            /* amra limit set kore amra onk gulo data er moddhe specific kicu data k show korte pari limit() set kore diye...
            ** products = await cursor.limit(10).toArray();
            */
            
            res.send(products);
        });

        /* count data for pagination : amra query nise ter moddhe amra productCollection k find() kore query k set kore ditase ai 2 ta kaj kore amra data gulo k cursor e set kortase and ai cursor er upor cursor.count() count set korse....kinto amra jei client side e number value k pathabo kinto number value JSON nh tai amra res.send() nh kore res k json e convert kore res.json(count) amra count k set kore diye json() e convert kore client side a parse kore nibo...amra res.send() er moddheo korte pari res.send({count}) amra res.send() er moddhe object akare count ta k set kore dite pari....   */
        app.get('/productCount', async (req, res) => {
            // const query = {};
            // const cursor = productCollection.find(query);
            /* warning : amra cursor.count() korle akta waring dibe.. normally amra shob gulo product load kore length ba count korbo nh karon database nijerai akta track rakhe jae koyta item ase jno amader ber ber khuja nh lage tai amra cursor er poriborte productCollection.estimatedDocumentCount() aita k use korbo...   */
            const count = await productCollection.estimatedDocumentCount();
            /* amara akta number */
            res.send({ count });
        });

        // use post to get products by keys (keys hocche amader id gulo) => keys gulo theke data load korar jonne amra search korte pari $in mongoDb amra website e jeye amra field dekhte pabo amara field er moddhe ki set korbo sheita dekhte amara database er kon property tah k khujbo shei gula r moddhe ki value thakbe sheita amra ai website theke hints pabo 
        app.post('/productByKeys', async (req, res) => {
            const keys = req.body;
            console.log(keys);
            /* amader id terminal dekhle bujte parbo id gulo shudhu string akare ase amra ai string gulo k id diye wrap kore pathate hbe nh hole amra pabo nh id gulo k error dibe...  */
            const ids = keys.map(id => ObjectId(id));
            const query = {_id: {$in: ids}}
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            console.log(keys);
            res.send(products);
        })
    }
    finally {
        // client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('john is running waiting for Ema');
});

app.listen(port, () => {
    console.log('Listening to the port', port);
});

