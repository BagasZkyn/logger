require("dotenv").config();
const { default: makeWASocket, useSingleFileAuthState, fetchLatestBaileysVersion, makeInMemoryStore } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const P = require("pino");
const fs = require("fs");

const { state, saveState } = useSingleFileAuthState("./auth.json");

async function startBot() {
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: P({ level: "silent" }),
        printQRInTerminal: true,
        auth: state
    });

    sock.ev.on("creds.update", saveState);

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (text === "!ping") {
            await sock.sendMessage(msg.key.remoteJid, { text: "Pong!" });
        }
    });

    console.log("Bot ready!");
}

startBot();
