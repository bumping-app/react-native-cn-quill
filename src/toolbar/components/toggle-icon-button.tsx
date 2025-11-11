import React from 'react';
import {
  TouchableWithoutFeedback,
  View,
  Image,
  StyleSheet,
  ImageSourcePropType,
  Text
} from 'react-native';
import type { ToolbarTheme } from '../../types';
import { useToolbar } from './toolbar-context';

interface Props {
  name: string;
  valueOn: string | number | boolean;
  valueOff: string | number | boolean;
  source: ImageSourcePropType;
}

export const ToggleIconButton: React.FC<Props> = (props) => {
  const { apply, isSelected, theme, styles, modalRef } = useToolbar();
  const { name, valueOff, valueOn, source } = props;
  const selected = isSelected(name, valueOn);
  const handlePresss = () => {apply(name, selected ? valueOff : valueOn); };
  const defaultStyles = makeStyles(theme);
  const toolStyle = styles?.selection?.iconToggle?.tool
    ? styles.selection.iconToggle.tool(defaultStyles.tool)
    : defaultStyles.tool;
  const overlayStyle = styles?.selection?.iconToggle?.overlay
    ? styles.selection.iconToggle.overlay(defaultStyles.overlay)
    : defaultStyles.overlay;
  const imageStyle = styles?.selection?.iconToggle?.image
    ? styles.selection.iconToggle.image(defaultStyles.image)
    : defaultStyles.image;
  return (
    <TouchableWithoutFeedback onPress={handlePresss}>
      <View style={[toolStyle, {flexDirection:'row', justifyContent:'center', borderWidth:0, }]}>
        {/* <Text style={{textTransform: 'capitalize'}}>{name}</Text> */}
        <Image source={source} style={[imageStyle, {tintColor:'white'}]}  />
        {selected && <View style={overlayStyle} />}
      </View>
    </TouchableWithoutFeedback>
  );
};

const makeStyles = (theme: ToolbarTheme) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.overlay,
      borderRadius: 3,
    },
    tool: {
      borderRadius: 3,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 2,
      marginRight: 0,
      marginLeft: 8,
      height: 30, // Math.round(theme.size),
      width: 30, //Math.round(theme.size),
      borderColor:'black',
      borderWidth:0,
    },
    image: {
      height: 16, // Math.round(theme.size * 0.6),
      width: 16, // Math.round(theme.size * 0.6),
      tintColor: theme.color,
    },
  });

ToggleIconButton.defaultProps = {
  valueOff: false,
};
