export function getInsertField(
    data: Record<string, any>,
    keys: string[]
) {
    const fields: string[] = [];
    const placeholders: string[] = [];
    const values: any[] = [];

    for (const key of keys) {
        const value = data[key];

        if (value != null) {
            fields.push(key);
            placeholders.push("?");
            values.push(value);
        }
    }

    return {
        field: fields.join(", "),
        placeholder: placeholders.join(", "),
        values
    };
}

export function getGetField(fields: string[]) : string{
    fields = fields.map((v, i) => {
        return `${camelToSnake(v)} as ${v}`
    })
    return fields.join(", ")
}

export function snakeToCamel(s: string) : string{
    return s.replace(/_([a-z0-9])/g, (_, c)=>{
        return c.toUpperCase();
    })
}

export function camelToSnake(s: string) : string{
    return s.replace(/[A-Z]/g, (c)=>{
        return `_${c.toLowerCase()}`
    })
}