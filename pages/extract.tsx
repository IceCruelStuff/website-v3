import React, {useState} from "react";
import * as PHAR from "phar";
import { saveAs } from "file-saver";
import Error from "../utils/Error";

function Extract() {
    const [ error, setError ] = useState(null);
    const [ files, setFiles ] = useState([]);

    const handleFileChange = (event) => setFiles(event.target.files);

    const extractPhar = () => {
        setError(null);
        const reader = new FileReader();

        reader.onload = async () => {
            try {
                const phar = new PHAR.Archive();

                phar.loadPharData(new Uint8Array(reader.result as ArrayBuffer));

                const data = await PHAR.ZipConverter.toZip(phar);

                const zip = await data.generateAsync({
                    type: 'uint8array',
                });

                saveAs(
                        new Blob([zip], {
                            type: 'application/zip',
                        }),
                        `${files[0].name
                                .split('.')
                                .slice(0, -1)
                                .join('.')}.zip`,
                );
            } catch {
                setError(Error.UnknownError)
            }
        };

        reader.readAsArrayBuffer(files[0])
    };

    return (
            <form onSubmit={extractPhar}>
                <label htmlFor="file">File</label>
                <input id="file" type="file" onChange={handleFileChange} accept=".phar" required />
                <button disabled={files.length < 1}>Extract</button>
            </form>
    )
}

export default Extract
