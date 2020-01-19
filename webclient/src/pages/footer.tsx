import React from 'react';

export const Footer: React.FC = () => (
  <footer className="footer">
    <div className="fl w-100 pv2 pv3-l ph1 ph3-m ph6-l flex items-center bg-black white">
      <div className="w-20 fl f7 nowrap">&copy; Thong Nguyen</div>
      <div className="w-80 tr f6">
        <a className="ml3 link dim lightest-blue" href="//github.com/ikumen/ubart-app">about</a>
      </div>
    </div>
  </footer>
);