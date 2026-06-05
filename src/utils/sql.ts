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

