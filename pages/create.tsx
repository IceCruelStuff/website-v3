import React, {useState} from "react";
import * as PHAR from "phar";
import { saveAs } from "file-saver";
import Error from "../utils/Error";

function Create() {
    const [ error, setError ] = useState(null);
    const [ files, setFiles ] = useState([]);
    const [ stub, setStub ] = useState('<?php __HALT_COMPILER();');

    const handleFileChange = (event) => setFiles(event.target.files);
    const handleStubChange = (event) => setStub(event.target.value);

    const createPhar = () => {
        setError(null);
        const reader = new FileReader();

        reader.onload = async () => {
            try {
                const phar = await PHAR.ZipConverter.toPhar(
                        new Uint8Array(reader.result as ArrayBuffer),
                );

                phar.setStub(stub);

                const blob = phar.savePharData();

                saveAs(
                        new Blob([blob], {
                            type: 'application/octet-stream',
                        }),
                        `${files[0].name
                                .split('.')
                                .slice(0, -1)
                                .join('.')}.phar`,
                );
            } catch {
                setError(Error.UnknownError)
            }
        };

        reader.readAsArrayBuffer(files[0])
    };

    return (
            <form onSubmit={createPhar}>
                <label htmlFor="file">File</label>
                <input id="file" type="file" onChange={handleFileChange} accept="application/zip" required />
                <label htmlFor="stub">Stub</label>
                <input type="text" onChange={handleStubChange} value={stub} required />
                <button type="submit" disabled={files.length < 1}>Create</button>
            </form>
    )
}

export default Create
