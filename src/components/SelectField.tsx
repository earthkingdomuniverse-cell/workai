import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { theme } from '../theme';

interface Option {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  error?: string;
  disabled?: boolean;
}

export function SelectField({
  label,
  placeholder = 'Select an option',
  value,
  onChange,
  options,
  error,
  disabled = false,
}: SelectFieldProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.selectContainer, error && styles.error, disabled && styles.disabled]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <Text style={selectedOption ? styles.selectedText : styles.placeholder}>
          {selectedOption?.label || placeholder}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || placeholder}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, value === item.value && styles.optionSelected]}
                  onPress={() => {
                    onChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[styles.optionText, value === item.value && styles.optionTextSelected]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface.input,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.surface.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  selectedText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
  },
  placeholder: {
    color: theme.colors.text.tertiary,
    fontSize: theme.typography.fontSize.md,
  },
  arrow: {
    color: theme.colors.text.tertiary,
    fontSize: theme.typography.fontSize.sm,
  },
  error: {
    borderColor: theme.colors.error.main,
  },
  disabled: {
    opacity: 0.5,
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.error.light,
    marginTop: theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background.secondary,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface.border,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  closeButton: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.tertiary,
  },
  option: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface.border,
  },
  optionSelected: {
    backgroundColor: theme.colors.primary[900],
  },
  optionText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  optionTextSelected: {
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[300],
  },
});
