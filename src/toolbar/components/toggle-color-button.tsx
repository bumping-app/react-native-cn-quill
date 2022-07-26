import React from 'react';
import { Text, TouchableWithoutFeedback, View, StyleSheet } from 'react-native';
import type { ToolbarTheme } from '../../types';
import { useToolbar } from './toolbar-context';

interface Props {
  valueOn: string | false;
  valueOff?: string | false;
  name: string;
}

export const ToggleColorButton: React.FC<Props> = (props) => {
  const { apply, isSelected, theme, styles } = useToolbar();
  const { name, valueOff, valueOn } = props;
  const selected = isSelected(name, valueOn);
  const handlePresss = () => apply(name, selected ? valueOff : valueOn);
  const defaultStyles = makeStyles(theme);
  const toolStyle = styles?.selection?.iconToggle?.tool
    ? styles.selection.iconToggle.tool(defaultStyles.tool)
    : defaultStyles.tool;
  const overlayStyle = styles?.selection?.iconToggle?.overlay
    ? styles.selection.iconToggle.overlay(defaultStyles.overlay)
    : defaultStyles.overlay;
  const noColorStyle = styles?.selection?.colorToggle?.noColor
    ? styles.selection.colorToggle.noColor(defaultStyles.noColor)
    : defaultStyles.noColor;

  // React.useEffect(() => {
  //   if (valueOn === '#000000') {
  //     handlePresss();
  //   }
  // },[]);

  return (

    <TouchableWithoutFeedback onPress={handlePresss}>
      <View style={[toolStyle, {flexDirection:'row', justifyContent:'space-between', width:'100%'}]}>
      <Text>{valueOn === '#000000' ? 'Black' : valueOn === '#33b04e' ? 'Green' : valueOn === '#8fa5f5' ? 'Blue' : 'Berry'}</Text>
      <View style={selected ? overlayStyle : null}>
      <View
          style={[
            toolStyle,
            {
              width: 30, height: 30, backgroundColor: valueOn,
            },
          ]}
        />
          
          {/* {valueOn === false && <View style={noColorStyle} />} */}
        
        </View>
        </View>
    </TouchableWithoutFeedback>
  );
};

const makeStyles = (theme: ToolbarTheme) =>
  StyleSheet.create({
    // overlay: {
    //   ...StyleSheet.absoluteFillObject,
    //   borderRadius: 3,
    //   borderWidth: 1,
    //   borderColor: theme.color,
    // },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.overlay,
      borderRadius: 3,
      marginRight: 3,
      justifyContent: 'center',
      alignItems: 'flex-end'
    },
    // tool: {
    //   borderRadius: 3,
    //   alignItems: 'center',
    //   justifyContent: 'center',
    //   marginRight: 4,
    //   marginLeft: 4,
    //   height: Math.round(theme.size - 2),
    //   width: Math.round(theme.size - 2),
    // },
    tool: {
      borderRadius: 3,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 2,
      marginRight: 4,
      marginLeft: 4,
      height: Math.round(theme.size),
      width: Math.round(theme.size),
    },
    noColor: {
      borderTopWidth: 1,
      backgroundColor: theme.overlay,
      borderColor: theme.color,
      width: '100%',
      transform: [{ rotate: '45deg' }],
    },
  });

ToggleColorButton.defaultProps = {
  valueOff: false,
};
