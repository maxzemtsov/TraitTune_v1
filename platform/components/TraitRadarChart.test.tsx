// /home/ubuntu/traittune/platform/app/components/TraitRadarChart.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TraitRadarChart from './TraitRadarChart'; // Adjust path as necessary

// Mock Recharts ResponsiveContainer and RadarChart as they might have issues in JSDOM
jest.mock('recharts', () => {
  const OriginalRecharts = jest.requireActual('recharts');
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    RadarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="radar-chart">{children}</div>,
    PolarGrid: () => <div data-testid="polar-grid" />,
    PolarAngleAxis: ({ dataKey }: { dataKey: string }) => <div data-testid="polar-angle-axis" data-key={dataKey} />,
    PolarRadiusAxis: ({ angle, domain }: { angle: number, domain: [number, number] }) => <div data-testid="polar-radius-axis" data-angle={angle} data-domain={domain.join(',')} />,
    Radar: ({ name, dataKey, stroke, fill, fillOpacity }: { name: string, dataKey: string, stroke: string, fill: string, fillOpacity: number }) => (
      <div data-testid="radar" data-name={name} data-datakey={dataKey} data-stroke={stroke} data-fill={fill} data-fillopacity={fillOpacity} />
    ),
    Legend: () => <div data-testid="legend" />,
    Tooltip: () => <div data-testid="tooltip" />,
  };
});

const mockRadarData = [
  { subject: 'Trait A', score: 80, fullMark: 100 },
  { subject: 'Trait B', score: 65, fullMark: 100 },
  { subject: 'Trait C', score: 90, fullMark: 100 },
  { subject: 'Trait D', score: 75, fullMark: 100 },
  { subject: 'Trait E', score: 50, fullMark: 100 },
];

describe('TraitRadarChart', () => {
  test('renders the radar chart with provided data and userName', () => {
    render(<TraitRadarChart data={mockRadarData} userName="Test User" />);

    // Check if the mocked components are rendered
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('polar-grid')).toBeInTheDocument();
    expect(screen.getByTestId('polar-angle-axis')).toBeInTheDocument();
    expect(screen.getByTestId('polar-radius-axis')).toBeInTheDocument();
    expect(screen.getByTestId('radar')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();

    // Check if data keys and names are passed correctly (example for Radar)
    const radarElement = screen.getByTestId('radar');
    expect(radarElement).toHaveAttribute('data-name', 'Test User');
    expect(radarElement).toHaveAttribute('data-datakey', 'score');
  });

  test('renders correctly with empty data', () => {
    render(<TraitRadarChart data={[]} userName="Test User Empty" />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    // Even with empty data, the structural components of the chart should render
    expect(screen.getByTestId('polar-grid')).toBeInTheDocument();
  });

  test('PolarAngleAxis uses subject as dataKey', () => {
    render(<TraitRadarChart data={mockRadarData} userName="Test User" />);
    const angleAxis = screen.getByTestId('polar-angle-axis');
    expect(angleAxis).toHaveAttribute('data-key', 'subject');
  });

  test('PolarRadiusAxis has correct angle and domain', () => {
    render(<TraitRadarChart data={mockRadarData} userName="Test User" />);
    const radiusAxis = screen.getByTestId('polar-radius-axis');
    expect(radiusAxis).toHaveAttribute('data-angle', '30');
    expect(radiusAxis).toHaveAttribute('data-domain', '0,100');
  });

  test('Radar component has correct props', () => {
    render(<TraitRadarChart data={mockRadarData} userName="Test User" />);
    const radar = screen.getByTestId('radar');
    expect(radar).toHaveAttribute('data-name', 'Test User');
    expect(radar).toHaveAttribute('data-datakey', 'score');
    expect(radar).toHaveAttribute('data-stroke', '#8884d8');
    expect(radar).toHaveAttribute('data-fill', '#8884d8');
    expect(radar).toHaveAttribute('data-fillopacity', '0.6');
  });

});

