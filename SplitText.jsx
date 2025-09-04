import { Text } from "react-native";

function SplitText({ text, className = "" }) {
  return (
    <Text className={className}>
      {text.split("").map((char, i) => (
        <Text key={i} className="char">
          {char === " " ? "\u00A0" : char}
        </Text>
      ))}
    </Text>
  );
}

export default SplitText;