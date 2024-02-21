const addZero = (number) => {
    number = number < 10 ? `0${number}` : number;
    return number;
}

const checkInteger = (number) => {
    return (Number.isInteger(number) && number >= 1 && number <= 90);
}

export {addZero, checkInteger};
