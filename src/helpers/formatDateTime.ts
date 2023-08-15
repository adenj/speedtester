export const formatDateTime = (inputDate: string) => {
    const date = new Date(inputDate)
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const year = String(date.getFullYear()).slice(-2); // Last two digits of the year

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return {
        date: `${day}/${month}/${year}`,
        time: `${hours}:${minutes}:${seconds}`
    }
}