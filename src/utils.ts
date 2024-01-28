export function getDatetimeISOStringWithOffset(d: Date)
{
    const offset = d.getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes =  Math.abs(offset) % 60;
    const sign = Math.sign(offset);
    return `${('000' + d.getFullYear()).slice(-4)}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}T` +
        `${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}:${('0' + d.getSeconds()).slice(-2)}.${('00' + d.getMilliseconds()).slice(-3)}` +
        (hours == 0 && minutes == 0 ? 'Z' : `${sign > 0 ? '-' : '+'}${('0' + hours).slice(-2)}:${('0' + minutes).slice(-2)}`);
}
