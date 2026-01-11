/**
 * Integración con Google Drive
 * 
 * Permite a los usuarios:
 * - Conectar su cuenta de Google Drive
 * - Subir imágenes de boletas
 * - Exportar archivos Excel
 */

// Scopes necesarios para Google Drive
export const GOOGLE_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata',
];

// Nombre de la carpeta en Drive
const FOLDER_NAME = 'Boleta Scanner';

/**
 * Obtiene o crea la carpeta de la aplicación en Drive
 */
export async function getOrCreateAppFolder(accessToken: string): Promise<string> {
  // Buscar si ya existe la carpeta
  const searchResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const searchData = await searchResponse.json();

  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Crear carpeta si no existe
  const createResponse = await fetch(
    'https://www.googleapis.com/drive/v3/files',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    }
  );

  const createData = await createResponse.json();
  return createData.id;
}

/**
 * Sube un archivo a Google Drive
 */
export async function uploadToDrive(
  accessToken: string,
  file: Blob,
  fileName: string,
  mimeType: string,
  folderId?: string
): Promise<{ success: boolean; fileId?: string; error?: string }> {
  try {
    // Si no se especifica carpeta, usar la de la app
    const targetFolderId = folderId || await getOrCreateAppFolder(accessToken);

    // Metadata del archivo
    const metadata = {
      name: fileName,
      parents: [targetFolderId],
    };

    // Crear FormData para upload multipart
    const formData = new FormData();
    formData.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    formData.append('file', file);

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, fileId: data.id };
  } catch (error) {
    console.error('Error uploading to Drive:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Sube una imagen de boleta a Drive
 */
export async function uploadBoletaImage(
  accessToken: string,
  imageBlob: Blob,
  boletaId: string
): Promise<{ success: boolean; fileId?: string; error?: string }> {
  const fileName = `boleta_${boletaId}_${Date.now()}.jpg`;
  return uploadToDrive(accessToken, imageBlob, fileName, 'image/jpeg');
}

/**
 * Sube un archivo Excel a Drive
 */
export async function uploadExcelToDrive(
  accessToken: string,
  excelBuffer: Uint8Array,
  fileName: string
): Promise<{ success: boolean; fileId?: string; error?: string }> {
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  return uploadToDrive(accessToken, blob, `${fileName}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

/**
 * Lista archivos en la carpeta de la app
 */
export async function listAppFiles(
  accessToken: string
): Promise<{ files: Array<{ id: string; name: string; mimeType: string }> }> {
  const folderId = await getOrCreateAppFolder(accessToken);

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&fields=files(id,name,mimeType,createdTime)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();
  return data;
}
