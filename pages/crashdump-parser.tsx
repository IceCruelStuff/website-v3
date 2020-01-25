import React, {useState} from "react";
import pako from "pako";

enum Error {
    InvalidCrashdump = "INVALID_CRASHDUMP"
}

function CrashdumpParser() {
    const [ error, setError ] = useState(null);
    const [ parsedCrashdump, setParsedCrashdump ] = useState("");

    const resetCrashdump = () => setParsedCrashdump("");

    const parseCrashdump = (event) => {
        setError(null);
        let rawCrashdump = event.target.value;
        // Strip beginning and end
        const regex = /===BEGIN CRASH DUMP===\n(.*\n)===END CRASH DUMP===/;
        const match = regex.exec(rawCrashdump);
        if (!match || !match[1]) {
            setError(Error.InvalidCrashdump);
            resetCrashdump();
            return
        }
        rawCrashdump = match[1];
        // Decode base 64
        try {
            rawCrashdump = atob(rawCrashdump);
        } catch {
            setError(Error.InvalidCrashdump);
            resetCrashdump();
            return
        }
        // Inflate zlib
        try {
            rawCrashdump = pako.inflate(rawCrashdump);
        } catch {
            setError(Error.InvalidCrashdump);
            resetCrashdump();
            return
        }
        // Decode crashdump to JSON
        try {
            rawCrashdump = new TextDecoder("utf-8").decode(rawCrashdump);
        } catch {
            setError(Error.InvalidCrashdump);
            resetCrashdump();
            return
        }
        const parsedJson = JSON.parse(rawCrashdump);
        if (!parsedJson) {
            setError(Error.InvalidCrashdump);
            resetCrashdump();
            return
        }
        const stringifiedJson = JSON.stringify(parsedJson, null, 2);
        setParsedCrashdump(stringifiedJson)
    };

    const placeholder = `----------------------REPORT THE DATA BELOW THIS LINE-----------------------
===BEGIN CRASH DUMP===
===END CRASH DUMP===`;

    return (
        <>
            <textarea cols={76} rows={12} onChange={parseCrashdump} placeholder={placeholder}>
            </textarea>
            {parsedCrashdump}
            Error: {error}
        </>
    )
}

export default CrashdumpParser
