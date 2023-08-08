import React, { useEffect, useRef } from 'react';
import '../../App.css';
import { DataSet } from 'vis-data';
import { Timeline } from 'vis-timeline';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';

const MyTimeline = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const groups = new DataSet([
        { id: 1, content: 'Max Mustermann' },
        { id: 2, content: 'Erika Mustermann' },
        // Weitere Gruppen/Mitarbeiter hinzufügen
      ]);

      const items = new DataSet([
        { id: 1, group: 1, content: 'test', start: '2022-08-08', end: '2022-08-08 12:00:00' },
        { id: 2, group: 2, content: '', start: '2022-08-09', end: '2022-08-09 14:00:00' },
        // Weitere Items hinzufügen
      ]);

      const options = {
        orientation: 'top',
        verticalScroll: true,
        zoomable: true,
      };

      const timeline = new Timeline(containerRef.current, items, groups, options);

  // Bereinigungsfunktion
      return () => {
        timeline.destroy();
      };
    }
  }, []);

  return <div ref={containerRef} style={{ height: '400px' }}></div>;
};

export default MyTimeline;
