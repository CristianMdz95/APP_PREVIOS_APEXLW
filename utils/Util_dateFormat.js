const moment = require('moment');

const Util_dateFormat = (dateValue, type = false) => {
    if (dateValue) {
        if (dateValue.length !== 2) {


            if (type === 'datetime') {
                return moment.utc(dateValue).format('DD/MM/YYYY HH:mm:ss')
            } else {
                return moment.utc(dateValue).format('DD/MM/YYYY')
            }


        } else {
            let arrValues = []
            dateValue.forEach((value, index) => {
                if (value !== null) {

                    const fechaMoment = moment(value);
                    let formattedDate

                    if (type === 'datetime') {
                        formattedDate = fechaMoment.format('DD/MM/YYYY HH:mm:ss');
                    } else {
                        formattedDate = fechaMoment.format('DD/MM/YYYY');
                    }

                    arrValues.push(formattedDate)
                }
            })
            return arrValues;
        }
    } else {
        return null;
    }
}

const Util_dateFormatRevert = (dateValue) => {

    if (dateValue) {
        const fechaMoment = moment(dateValue, 'DD/MM/YYYY').toISOString()
        const fechaDate = new Date(fechaMoment);
        return fechaDate
    } else {
        return '';
    }
}

export { Util_dateFormat, Util_dateFormatRevert }