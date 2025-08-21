import './GroupBox.style.css';

import type { GroupBoxProps } from './GroupBox.type';

const GroupBox = ({ label, border, children }: GroupBoxProps) => {
  return (
    <div
      className={`groupbox ${border ? 'groupbox-border' : 'groupbox-border-top'}`}
    >
      <div className="groupbox-label">{label}</div>
      <div className="groupbox-content">{children}</div>
    </div>
  );
};

export default GroupBox;
