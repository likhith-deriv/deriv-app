import { useCallback, useEffect, useMemo, useState } from 'react';
import useMutation from '../useMutation';
import { compressImageFile, generateChunks, numToUint8Array, readFile } from '../utils';
import md5 from 'md5';
import { getActiveWebsocket } from '../APIProvider';

type TDocumentUploadPayload = Parameters<ReturnType<typeof useMutation<'document_upload'>>['mutate']>[0]['payload'];
type TUploadPayload = Omit<TDocumentUploadPayload, 'expected_checksum' | 'file_size'> & {
    file?: File;
};

/** A custom hook to handle document file uploads to our backend. */
const useDocumentUpload = () => {
    const {
        data,
        isLoading: _isLoading,
        isSuccess: _isSuccess,
        mutate,
        status,
        ...rest
    } = useMutation('document_upload');
    const [tempChunks, setTempChunks] = useState<Uint8Array[]>([]);
    const [isDocumentUploaded, setIsDocumentUploaded] = useState(false);
    const activeWebSocket = getActiveWebsocket();

    const isLoading = useMemo(() => _isLoading || !isDocumentUploaded, [_isLoading, isDocumentUploaded]);
    const isSuccess = useMemo(() => _isSuccess && isDocumentUploaded, [_isSuccess, isDocumentUploaded]);

    const sendChunks = useCallback(
        (chunks: Uint8Array[]) => {
            const id = numToUint8Array(data?.document_upload?.upload_id || 0);
            const type = numToUint8Array(data?.document_upload?.call_type || 0);

            chunks.forEach(chunk => {
                const size = numToUint8Array(chunk.length);
                const payload = new Uint8Array([...type, ...id, ...size, ...chunk]);
                activeWebSocket?.send(payload);
            });
            setIsDocumentUploaded(true);
        },
        [data, activeWebSocket]
    );

    const upload = useCallback(
        async (payload: TUploadPayload) => {
            if (!payload?.file) return Promise.reject(new Error('No file selected'));
            setIsDocumentUploaded(false);
            const file = payload.file;
            delete payload.file;
            const fileBlob = await compressImageFile(file);
            const modifiedFile = await readFile(fileBlob);
            // @ts-expect-error type mismatch
            const fileBuffer = new Uint8Array(modifiedFile.buffer);
            const checksum = md5(Array.from(fileBuffer));

            const updatedPayload = {
                ...payload,
                expected_checksum: checksum,
                file_size: fileBuffer.length,
                passthrough: {
                    document_upload: true,
                },
            };
            const chunks = generateChunks(fileBuffer, { chunkSize: 16384 });
            setTempChunks(chunks);
            await mutate({ payload: updatedPayload });
        },
        [mutate]
    );

    useEffect(() => {
        if (status === 'success' && tempChunks.length && data) {
            sendChunks(tempChunks);
            setTempChunks([]);
        }
    }, [data, status, sendChunks, tempChunks]);

    const modified_response = useMemo(() => ({ ...data?.document_upload }), [data?.document_upload]);

    return {
        /** The upload response */
        data: modified_response,
        /** Function to upload the document */
        upload,
        /** Mutation status */
        status,
        /** Whether the mutation is loading */
        isLoading,
        /** Whether the mutation is successful */
        isSuccess,
        ...rest,
    };
};

export default useDocumentUpload;
