export const getBase64 = async (url: string) => {
    const res = await fetch(url);
    const blob = await res.blob();

    return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
};
