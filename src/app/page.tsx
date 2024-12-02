"use client";

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
import { useEffect, useState, useMemo, useCallback } from "react";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Card from "./components/Card";
import Loading from "./components/Loading";
import ReconnectModal from "./components/ReconnectModal";
import { useTheme } from './context/ThemeContext';
import { useFullScreen } from './context/FullScreenContext';
import { fetchMachines } from '@/services/api';
import { fetchCpuData, type CpuData } from '@/services/api/cpu';

interface Machine {
  device_id: number;
  target: number;
  mtg: number;
  actual: number;
  wait_time: number;
  total_min: number;
  shift_1: string;
  shift_2: string;
  temp: number;
  actual_delta_seconds: number;
  device_total_seconds: number;
  connection: boolean;
  ts: number;
  dt: string;
  name?: string;
  enable: boolean;
}

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ChartDataLabels);

// Constants
const FETCH_INTERVAL = 1000;
const SCROLL_INTERVAL = 10000;

const HomePage = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [cpuData, setCpuData] = useState<CpuData | null>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [showPerformance, setShowPerformance] = useState(true);
  const [showActual, setShowActual] = useState(true);
  const [isCpuDisconnected, setIsCpuDisconnected] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const { isDark } = useTheme();
  const { isFullScreen } = useFullScreen();

  // Optimized fetch functions with useCallback
  const fetchMachineData = useCallback(async () => {
    try {
      if (isFirstLoad) {
        setIsLoading(true);
      }
      const data = await fetchMachines();
      setMachines(data);
      setIsDisconnected(false);
      if (isFirstLoad) {
        setIsFirstLoad(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      setIsDisconnected(true);
      if (isFirstLoad) {
        setIsLoading(false);
      }
    }
  }, [isLoading, isFirstLoad]);

  const fetchCpuDataHandler = useCallback(async () => {
    try {
      const data = await fetchCpuData();
      setCpuData(data);
      setIsCpuDisconnected(!data.connection);
    } catch (error) {
      console.error("Lỗi khi gọi API CPU:", error);
      setIsCpuDisconnected(true);
    }
  }, []);

  const handleReconnect = useCallback(() => {
    window.location.reload();
  }, []);

  // Optimized calculations with useMemo
  const enabledCount = useMemo(() =>
    machines.filter((machine) => machine.enable).length,
    [machines]
  );

  const idCount = useMemo(() =>
    machines.filter((machine) => machine.device_id).length,
    [machines]
  );

  const filteredMachines = useMemo(() =>
    machines.filter((machine) => machine.actual !== 0 && machine.actual !== 0),
    [machines]
  );

  // Optimized handlers with useCallback
  const handleScrollNext = useCallback(() => {
    const maxScrollIndex = Math.ceil(machines.length / 5) - 1;
    setScrollIndex(prev => prev < maxScrollIndex ? prev + 1 : 0);
  }, [machines.length]);

  const handleScrollPrev = useCallback(() => {
    const maxScrollIndex = Math.ceil(machines.length / 5) - 1;
    setScrollIndex(prev => prev > 0 ? prev - 1 : maxScrollIndex);
  }, [machines.length]);



  // Effects
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        handleScrollPrev();
      } else if (event.key === "ArrowRight") {
        handleScrollNext();
      }
    };
    document.addEventListener("keydown", handleKeyPress);

    const intervalId = setInterval(() => {
      fetchMachineData();
      fetchCpuDataHandler();
    }, FETCH_INTERVAL);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [fetchMachineData, fetchCpuDataHandler, handleScrollNext, handleScrollPrev]);

  useEffect(() => {
    const autoScrollInterval = setInterval(() => {
      setScrollIndex((prevIndex) => {
        const maxScrollIndex = Math.ceil(machines.length / 5) - 1;
        return prevIndex < maxScrollIndex ? prevIndex + 1 : 0;
      });
    }, SCROLL_INTERVAL);

    return () => clearInterval(autoScrollInterval);
  }, [machines.length]);

  useEffect(() => {
    fetchMachineData();
  }, [fetchMachineData]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <ReconnectModal 
        isOpen={isCpuDisconnected} 
        onReconnect={handleReconnect} 
      />
      <ReconnectModal isOpen={isDisconnected} onReconnect={fetchMachineData} />
      {isLoading && <Loading isDarkMode={isDark} />}
      <div className={`p-3 overflow-hidden ${isFullScreen ? "h-[93vh]" : "h-[91vh]"} relative flex flex-col justify-between w-full ${isDark ? 'bg-bg-dark' : 'bg-bg-light'}`}>
        <div className="flex justify-between gap-3 py-2 scale-[100%]">
          <div className={`flex-1 ${isDark ? 'bg-secondary text-text-dark shadow-[inset_0px_0px_4px_rgba(255,255,255,1)]' : 'bg-gray-300 text-text-light shadow-[inset_0px_0px_4px_rgba(0,0,0,1)]'} p-2 md:py-8 transition-transform rounded-lg ${isFullScreen ? "h-[40vh]" : "h-[34vh]"} `}>
            <div className='flex space-x-20 justify-start item-center'>
              <div className="flex space-x-20 text-sm  text-center font-bold item-center gap-x-2 select-none">
                MỤC TIÊU (PCS)
              </div>
              <div className="text-lg  text-center font-bold select-none">
                BIỂU ĐỒ THỂ HIỆN MỤC TIÊU GIỜ CỦA TỪNG CHUYỀN 
              </div>
              <div className=" flex space-x-20 text-sm  text-center font-bold gap-x-2 select-none" >
              </div>
            </div>
            <Bar className='px-7'
              data={{
                labels: machines
                  .filter((machine) => machine.mtg !== 0 && machine.enable && machine.connection)
                  .map((machine) => machine.name),
                datasets: [
                  {
                    label: 'Mục Tiêu Giờ',
                    data: machines
                      .filter((machine) => machine.mtg !== 0 && machine.enable && machine.connection)
                      .map((machine) => machine.mtg),
                    backgroundColor: machines
                      .filter((machine) => machine.mtg !== 0 && machine.enable && machine.connection)
                      .map((machine) =>
                        machine.mtg < 0 ? '#c40005' : '#00964d'
                      ),
                    borderColor: '#111111',
                    borderWidth: 1,
                    barThickness: 50,
                    borderRadius: 5,
                    yAxisID: 'y1',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1.5,
                plugins: {
                  legend: {
                    display: false,
                    labels: {
                      font: {
                        size: 18,
                      },
                      color: isDark ? '#ffffff' : '#333333',
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context: any) {
                        return context.dataset.label + ': ' + context.parsed.y;
                      },
                    },
                  },
                  datalabels: {
                    display: true,
                    color: isDark ? '#ffffff' : '#333333',
                    font: {
                      size: 14,
                      weight: 'bold',
                    },
                    formatter: (value: number) => value,
                    anchor: (context: any) => {
                      const value = context.dataset.data[context.dataIndex];
                      return value > 0 ? 'end' : 'start';
                    },
                    align: (context: any) => {
                      const value = context.dataset.data[context.dataIndex];
                      return value > 0 ? 'start' : 'start';
                    },
                    offset: (context: any) => {
                      const value = context.dataset.data[context.dataIndex];
                      const yPos = context.chart.scales['y'].getPixelForValue(value);
                      return value > 0 ? -20 : 0;
                    },
                  },
                },
                scales: {
                  x: {
                    grid: {
                      color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      lineWidth: 1
                    },
                    ticks: {
                      font: {
                        weight: 'bold',
                        size: 14,
                      },
                      color: isDark ? '#ffffff' : '#333333',
                    },
                  },
                  y: {
                    title: {
                      display: false,
                      text: 'Mục Tiêu (PCS)',
                      font: {
                        size: 16,
                        weight: 'bold',
                      },
                      color: isDark ? '#ffffff' : '#333333',
                    },
                    grid: {
                      color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      lineWidth: 1
                    },
                    ticks: {
                      font: {
                        weight: 'bold',
                        size: 14,
                      },
                      color: isDark ? '#ffffff' : '#333333',
                    },
                    min: Math.floor(
                      Math.min(0, Math.min(...machines.filter((machine) => machine.mtg !== 0 && machine.enable).map((machine) => machine.mtg)) * 1.2) / 5
                    ) * 5,

                    max: Math.ceil(
                      Math.max(...machines.filter((machine) => machine.mtg !== 0 && machine.enable).map((machine) => machine.mtg)) * 1.2 / 5
                    ) * 5,

                  },
                  y1: {
                    position: 'right',
                    display: true,
                    grid: {
                      color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      lineWidth: 1
                    },
                    ticks: {
                      display: false,
                    },
                    min: Math.floor(
                      Math.min(0, Math.min(...machines.filter((machine) => machine.mtg !== 0 && machine.enable).map((machine) => machine.mtg)) * 1.2) / 5
                    ) * 5,

                    max: Math.ceil(
                      Math.max(...machines.filter((machine) => machine.mtg !== 0 && machine.enable).map((machine) => machine.mtg)) * 1.2 / 5
                    ) * 5,

                  },
                },
              }}
            />

          </div>



          {/* Biểu đồ Sản Lượng Thực Tế */}
          <div className={`flex-1 ${isDark ? 'bg-secondary text-text-dark shadow-[inset_0px_0px_4px_rgba(255,255,255,1)]' : 'bg-gray-300 text-text-light shadow-[inset_0px_0px_4px_rgba(0,0,0,1)]'} rounded-lg p-2 md:py-8 transition-transform ${isFullScreen ? "h-[40vh]" : "h-[34vh]"} `}>
            <div className='flex space-x-20 justify-between item-center' >
              <div className="flex space-x-20 text-sm text-center font-bold item-center gap-x-2 select-none" onClick={() => setShowPerformance((prev) => !prev)}>
                HIỆU SUẤT (%)
                <div className={`h-5 w-5 rounded-lg bg-notConnect `} />
              </div>
              <div className="text-lg text-center font-bold select-none">
                BIỂU ĐỒ HIỆU SUẤT VÀ THỰC HIỆN
              </div>
              <div className=" flex space-x-20 text-sm text-center font-bold gap-x-2 select-none" onClick={() => setShowActual((prev) => !prev)}>
                <div className={`h-5 w-5 rounded-lg bg-[#33cde5]`} />
                THỰC HIỆN (PCS)

              </div></div>

            <Bar className='px-7'
              data={{
                labels: filteredMachines.filter(machine => machine.enable && machine.connection).map((machine) => machine.name),
                datasets: [
                  showPerformance && {
                    label: 'Hiệu Suất',
                    data: filteredMachines.filter(machine => machine.enable && machine.connection).map((machine) => (machine.target - machine.actual)),
                    borderColor: '#c40005',
                    backgroundColor: 'rgba(255, 99, 71, 0.2)',
                    type: 'line',
                    fill: false,
                    tension: 0.4,
                    borderWidth: 2,
                    datalabels: {
                      display: false,
                    },
                  },
                  showActual && {
                    label: 'Thực Hiện',
                    data: filteredMachines.filter(machine => machine.enable).map((machine) => machine.actual),
                    backgroundColor: '#33cde5',
                    borderColor: '#111111',
                    borderWidth: 1,
                    barThickness: 50,
                    yAxisID: 'y1',
                    borderRadius: 5,
                    datalabels: {
                      display: true,
                      align: 'start',
                      anchor: 'end',
                      offset: -20,
                      color: isDark ? '#ffffff' : '#333333',
                      font: {
                        size: 14,
                        weight: 'bold',
                      },
                    },
                  },
                ].filter(Boolean) as any,
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1.5,
                scales: {
                  x: {
                    grid: {
                      color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      lineWidth: 1
                    },
                    ticks: {
                      font: {
                        weight: 'bold',
                        size: 14,
                      },
                      color: isDark ? '#ffffff' : '#333333',
                    },
                  },
                  y: {
                    stacked: true,
                    grid: {
                      color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      lineWidth: 1
                    },
                    ticks: {
                      font: {
                        weight: 'bold',
                        size: 14,
                      },
                      color: isDark ? '#ffffff' : '#333333',
                    },
                    min: 0,
                    max: 100,
                  },
                  y1: {
                    stacked: false,
                    position: 'right',
                    grid: {
                      color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      lineWidth: 1
                    },
                    ticks: {
                      font: {
                        weight: 'bold',
                        size: 14,
                      },
                      color: isDark ? '#ffffff' : '#333333',
                    },

                    min: 0,
                    max: Math.ceil(
                      Math.max(...filteredMachines.filter(machine => machine.enable).map((machine) => machine.actual)) * 1.2 / 50
                    ) * 50,
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    displayColors: false,
                    callbacks: {
                      title: function (tooltipItems) {
                        return tooltipItems[0].label;
                      },
                      label: function (context) {
                        const filteredIndex = context.dataIndex;
                        let performanceValue = (filteredMachines[filteredIndex].actual / filteredMachines[filteredIndex].target) * 100 || 0;
                        const actualValue = filteredMachines[filteredIndex].actual || 0;
                        const targetValue = filteredMachines[filteredIndex].target || 0;
                        const remainValue = targetValue - actualValue;
                        if (targetValue < 0) {
                          performanceValue = 100;
                        }
                        // Hàm định dạng tooltip với label trái, giá trị và đơn vị phải
                        const dinhDangTooltip = (nhan: string, giaTri: number, donVi: string) => {
                          const tongDoDai = 25; // Độ dài cố định cho phần giữa
                          const phanGiaTri = `${giaTri} ${donVi}`;
                          const khoangTrang = ' '.repeat(Math.max(0, tongDoDai - nhan.length - phanGiaTri.length));
                          return `${nhan}${khoangTrang}${phanGiaTri}`;
                        };
                        const dinhDangTooltip1 = (nhan: string, giaTri: number, donVi: string) => {
                          const tongDoDai = 29; // Độ dài cố định cho phần giữa
                          const phanGiaTri = `${giaTri} ${donVi}`;
                          const khoangTrang = ' '.repeat(Math.max(0, tongDoDai - nhan.length - phanGiaTri.length));
                          return `${nhan}${khoangTrang}${phanGiaTri}`;
                        };

                        return [
                          dinhDangTooltip('Hiệu suất:', performanceValue, '%'),
                          dinhDangTooltip('Thực hiện:', actualValue, 'PCS'),
                          dinhDangTooltip1('Còn lại:', remainValue, 'PCS')
                        ];
                      },
                    },
                  },
                  datalabels: {
                    display: false,
                  },
                },
              }}
              plugins={[ChartDataLabels]}
            />

          </div>

        </div>

        <div className={` font-semibold flex space-x-20 justify-between p-0 py-2 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
          <div className=' flex justify-start'>
            <div className="select-none">
              Số Line đang hoạt động: {enabledCount}/{idCount}
            </div>
          </div>
          <div className='justify-end'>
            {cpuData && (
              <div className="flex items-center space-x-3">
                <div className="select-none">
                  FPS: {cpuData.fps} |
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-5 w-5 rounded-full ${cpuData.connection ? 'bg-connect' : 'bg-notConnect'}`} />
                  <span className={`${cpuData.connection ? 'text-connect' : 'text-notConnect'}`}>
                    {cpuData.connection ? 'Có kết nối' : 'Mất kết nối'}
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>


        <div className="flex items-center justify-between p-2.5">


          <div
            className="flex transition-transform gap-x-3"
            style={{
              transform: `translateX(calc(-${scrollIndex * (100 / 0.984)}% - 0.5vw))`,
            }}
          >
            {isLoading ? (
              <div className="flex justify-center items-center w-full h-[30vh] ml-[90vh]">
                <div className="w-16 h-16 border-4 bo border-t-4 border-t-blue-500 rounded-full animate-spin "></div>
              </div>
            ) : (
              machines.length === 0 ? (
                <div className="text-center text-[#333333] text-xl md:text-3xl h-[30vh] ml-[80vh] select-none">
                  Mất kết nối
                </div>
              ) : (
                machines.map((machine) => (
                  <Card key={machine.device_id} machine={machine} isDarkMode={isDark} />
                ))
              )
            )}
          </div>
        </div>

        <div className={`${isDark ? "text-text-dark" : "text-text-light"} font-semibold flex flex-col justify-center items-center h-screen px-8 text-2xl relative`}>
          {/* Nội dung trạng thái */}
          <div className="space-x-20 flex items-center mb-0">
            <div className="flex items-center space-x-2">
              <div className="select-none">Có Kết Nối</div>
              <div className={`h-5 w-5 rounded-lg bg-[#00964d]`} />
            </div>
            <div className="flex items-center space-x-2">
              <div className="select-none">Không Hoạt Động</div>
              <div className={`h-5 w-5 rounded-lg bg-gray-400`} />
            </div>
            <div className="flex items-center space-x-2">
              <div className="select-none">Mất Kết Nối</div>
              <div className={`h-5 w-5 rounded-lg bg-notConnect`} />
            </div>
          </div>

          {/* Nút cuộn trước và sau */}
          <button
            onClick={handleScrollPrev}
            className={`absolute left-5 top-[50%] transform -translate-y-[50%] ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} border-2 rounded-xl bg-transparen text-2xl w-10 h-10 flex items-center justify-center hover:scale-[150%] transition-transform duration-300 z-10`}
          >
            &lt;
          </button>

          <button
            onClick={handleScrollNext}
            className={`absolute right-5 top-[50%] transform -translate-y-[50%] ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} border-2 rounded-xl bg-transparent  text-2xl w-10 h-10 flex items-center justify-center hover:scale-[150%] transition-transform duration-300 z-10`}
          >
            &gt;
          </button>
        </div>
      </div >
    </div>
  );
};

export default HomePage;
