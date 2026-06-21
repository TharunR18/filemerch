import supabase from "../config/supabase.js";

export async function uploadFile(file, path, contentType) {
    const options = contentType ? { contentType } : {};
    const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(path, file, options);

    if (error) throw error;
    return data;
}

export async function deleteFile(path) {
    const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .remove(path);

    if (error) throw error;
    return data;
}

export async function generateSignedUrl(path, options = {}) {
    const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .createSignedUrl(path, 60 * 60 * 24, options);

    if (error) throw error;
    return data;
}