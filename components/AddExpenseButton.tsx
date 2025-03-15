import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const AddExpenseButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.addButton} onPress={onPress}>
      <Text style={styles.addButtonText}>+</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#00adf5",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
});

export default AddExpenseButton;
