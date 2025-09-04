import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { gsap } from "gsap";

function scrambleChar(element, finalChar, scrambleChars = "01#$%&") {
  const iterations = 6;
  const delay = 0.05;
  let i = 0;

  function scramble() {
    if (i < iterations) {
      if (element) {
        element.textContent =
          scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        i++;
        gsap.delayedCall(delay, scramble);
      }
    } else {
      if (element) {
        element.textContent = finalChar;
      }
    }
  }

  scramble();
}

function ScrambledTextAlt({
  text = "Hello World",
  scrambleChars = "01#$%&",
  duration = 1,
  className = "",
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    const chars = rootRef.current.querySelectorAll(".char");

    const animations = [];

    chars.forEach((char, i) => {
      const animation = gsap.delayedCall(i * 0.1, () => {
        scrambleChar(char, char.dataset.final, scrambleChars);
      });
      animations.push(animation);
    });

    return () => {
      animations.forEach(animation => animation.kill());
    };
  }, []);

  return (
    <View className={className} ref={rootRef}>
      {text.split("").map((ch, i) => (
        <Text key={i} className="char" data-final={ch}>
          {ch}
        </Text>
      ))}
    </View>
  );
}

export default ScrambledTextAlt;