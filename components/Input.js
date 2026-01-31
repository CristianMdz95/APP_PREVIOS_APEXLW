import React from "react";
import { TextInput } from "react-native";

export default function Input(props) {
  let { placeholder, value, onChangeText } = props;

  return (
    <TextInput
      style={{
        borderWidth: 0.5,
        padding: 10,
        height: 50,
        borderColor: "gray",
        backgroundColor: "white",
        borderRadius: 5,
      }}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
    />
  );
}
