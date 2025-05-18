//ws server

const webSocket = require('ws');

const websock = () => {

    const wss = new webSocket.Server({ port: 8080, path: '/climateData' });

    const channels = {};
    let id = 0;

    //para cada conexion (cada cliente)
    wss.on("connection", (ws) => { //ws cliente en particular
        ws.id = id++;
        let channel;
        console.log("Client connected: " + ws.id);
        //envio mensaje a cliente conectado ws
        if (ws.readyState === webSocket.OPEN) {
            ws.send(JSON.stringify({ responsews: 'Client connected nro:' + ws.id }));
        }

        //por cada mensaje de cada cliente
        ws.on('message', (message) => {
            const enc = new TextDecoder("utf-8");
            const text = enc.decode(new Uint8Array(message).buffer);
            const jsonobj = JSON.parse(text);
            channel = jsonobj.group;

            if (!channels[channel]) {
                channels[channel] = [];
            }

            const exist = channels[channel].find(wso => wso.id === ws.id);

            //si el cliente ya existe en el canal no lo agrego
            if (!exist) {
                channels[channel].push(ws); 
            }

            const theMessage = { message: message };
            //channels es arrays de clientes
            channels[channel].forEach((client) => { //client es cada ws
                console.log('message: ' + message)
                client.send(message);
            });
        });

        ws.on('error', console.error);

        ws.on('close', () => {
            console.log("Client disconnected");
            if (channel) {
                channels[channel] = channels[channel].filter((client) => client !== ws);
                //TODO SEND TO CLIENT CHANNEL=GROUP 
                //client.send(JSON.stringify(channel));
            }
        });

    });
}

module.exports = websock;