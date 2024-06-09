const formatCompName = (str: string) => {
    // remove spaces and special characters
    return str
        .split('-')
        .map((item) => {
            const firstChar = isNaN(Number(item.charAt(0)))
                ? item.charAt(0).toUpperCase()
                : item.charAt(0);

            console.log({ firstChar });
            return firstChar + item.slice(1).toLowerCase();
        })
        .join('')
        .replace(/[^a-zA-Z0-9]/g, '');
};

console.log(formatCompName('arrow-left-01'));
