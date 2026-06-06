export function idToURL(id: number | undefined){
    if(id == undefined){
        return `/storage/-1`
    }
    return `/storage/${id}`
}