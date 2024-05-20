import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
/* import AntDesign from '@expo/vector-icons/AntDesign'; */

const Select = (props) => {

    const {
        data = [],
        value = null,
        onChange = () => { },
        search = false,
        onBlur = null
    } = props;


    const [isFocus, setIsFocus] = useState(false);

    return (
        <Dropdown
            style={[styles.dropdown, isFocus && { borderColor: 'black' }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={data}
            search={search}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Seleccionar' : 'Seleccionar'}
            searchPlaceholder="Buscar..."
            value={value}
            onFocus={() => setIsFocus(true)}
            onBlur={onBlur}
            onChange={onChange}
        /*             renderLeftIcon={() => (
                        <AntDesign
                            style={styles.icon}
                            color={isFocus ? 'blue' : 'black'}
                            name="Safety"
                            size={20}
                        />
                    )} */
        />
    );
};

export default Select;

const styles = StyleSheet.create({
    dropdown: {
        backgroundColor: 'white',
        height: 50,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    icon: {
        marginRight: 5,
    },
    label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 15,
    },
    placeholderStyle: {
        color: '#83829A',
        fontSize: 15,
    },
    selectedTextStyle: {
        fontSize: 15,
    },
    iconStyle: {
        width: 20,
        height: 18,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 15,
    },
});