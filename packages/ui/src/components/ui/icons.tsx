import { ComponentProps } from 'react';

type IconProps = ComponentProps<'svg'>;

export const LogoIcon = ({
  textColor,
  ...rest
}: IconProps & { textColor?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 64 64"
      {...rest}
    >
      <rect width="64" height="64" fill="none" />
      <defs>
        <filter id="faviconShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2"
            floodColor="#000"
            floodOpacity="0.1"
          />
        </filter>
      </defs>
      <text
        x="32"
        y="35"
        fontFamily="'Dancing Script', cursive"
        fontSize="22"
        fontWeight="600"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={textColor}
      >
        KYH
      </text>
    </svg>
  );
};
