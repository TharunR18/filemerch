import supabase from "../config/supabase.js";

export async function uploadFile(file, path) {
    const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(path, file);

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

export async function generateSignedUrl(path) {
    const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .createSignedUrl(path, 60 * 60 * 24);

    if (error) throw error;
    return data;
}