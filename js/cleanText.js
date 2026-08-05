const cleanText = (value, defaultValue) => {
    const result = String(value ?? "").trim();
    return result === "" ? defaultValue : result;
};

const cleanText_array = (array, defaultValue) => {
    return array.map(function(item){
        return cleanText(item, defaultValue)});
};