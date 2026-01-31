import React from "react";
import { TextInput } from "react-native";

export default function InputArea(props) {
  let { placeholder, value, onChangeText } = props;

  return (
    <TextInput
      style={{
        textAlignVertical: "top",
        borderWidth: 0.5,
        padding: 10,
        height: 100,
        borderColor: "gray",
        backgroundColor: "white",
        borderRadius: 5,
      }}
      placeholder={placeholder}
      value={value}
      numberOfLines={40}
      multiline={true}
      onChangeText={onChangeText}
    />
  );
}
