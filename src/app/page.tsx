"use client";

import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
import { useEffect, useState, useMemo, useCallback } from "react";
import ChartDataLabels from 'chartjs-plugin-datalabels';

interface Machine {
  id: number;
  name: string;
  dailyTarget: number;
  hourTarget: number;
  actual: number;
  isConnect: boolean;
  enable: boolean;
  is_Blink: boolean;
  performance: number;
}

interface CpuData {
  fps: number;
  connection: boolean;
}

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ChartDataLabels);

// Constants
const FETCH_INTERVAL = 1000;
const SCROLL_INTERVAL = 10000;
const LOADING_TIMEOUT = 5000;

const HomePage = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [cpuData, setCpuData] = useState<CpuData | null>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showPerformance, setShowPerformance] = useState(true);
  const [showActual, setShowActual] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Optimized fetch functions with useCallback
  const fetchMachineData = useCallback(async () => {
    try {
      const timeoutId = setTimeout(() => setIsLoading(false), LOADING_TIMEOUT);
      const response = await fetch("/api/machines");
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("API response not ok");
      }

      const data = await response.json();
      const updatedMachines = data.map((machine: Machine) => ({
        ...machine,
        enable: machine.isConnect ? machine.enable : false,
        dailyTarget: machine.isConnect && machine.enable ? machine.dailyTarget : 0,
        hourTarget: machine.isConnect && machine.enable ? machine.hourTarget : 0,
        actual: machine.isConnect && machine.enable ? machine.actual : 0,
        performance: machine.isConnect && machine.enable ? machine.performance : 0,
      }));
      setMachines(updatedMachines);
      if (isLoading) setIsLoading(false);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      setIsLoading(false);
    }
  }, [isLoading]);

  const fetchCpuData = useCallback(async () => {
    try {
      const response = await fetch("/api/cpu");
      if (!response.ok) {
        throw new Error("API response not ok");
      }
      const data = await response.json();
      setCpuData(data);
    } catch (error) {
      console.error("Lỗi khi gọi API CPU:", error);
    }
  }, []);

  // Optimized fullscreen check with useCallback
  const checkFullScreen = useCallback(() => {
    const isFullScreenNow = window.innerHeight === screen.height;
    setIsFullScreen(isFullScreenNow);
  }, []);

  // Optimized calculations with useMemo
  const enabledCount = useMemo(() =>
    machines.filter((machine) => machine.enable || (!machine.isConnect)).length,
    [machines]
  );

  const idCount = useMemo(() =>
    machines.filter((machine) => machine.id).length,
    [machines]
  );

  const filteredMachines = useMemo(() =>
    machines.filter((machine) => machine.performance !== 0 && machine.actual !== 0),
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
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
    document.addEventListener("fullscreenchange", checkFullScreen);
    checkFullScreen();

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        handleScrollPrev();
      } else if (event.key === "ArrowRight") {
        handleScrollNext();
      }
    };
    document.addEventListener("keydown", handleKeyPress);

    const intervalId = setInterval(() => {
      document.addEventListener("fullscreenchange", checkFullScreen);
      checkFullScreen();
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        setIsDarkMode(savedTheme === "dark");
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
      }

      fetchMachineData();
      fetchCpuData();
    }, FETCH_INTERVAL);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("fullscreenchange", checkFullScreen);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [fetchMachineData, fetchCpuData, checkFullScreen, handleScrollNext, handleScrollPrev]);

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
    const interval = setInterval(fetchMachineData, 5000);

    return () => clearInterval(interval);
  }, [fetchMachineData]);

  return (
    <>
      <div className={`p-3 overflow-hidden ${isFullScreen ? "h-[92vh]" : "h-[91vh]"} relative flex flex-col justify-between w-full ${isDarkMode ? 'bg-bg-dark' : 'bg-bg-light'}`}>
        <div className="flex justify-between gap-3 py-2 scale-[100%]">
          <div className={`flex-1 ${isDarkMode ? 'bg-[#1F2836] text-white' : 'bg-[#ffffff] text-black'} p-2 md:py-8 transition-transform shadow-[inset_0px_0px_4px_rgba(255,255,255,1)] rounded-lg ${isFullScreen ? "h-[40vh]" : "h-[34vh]"} `}>
            <div className='flex space-x-20 justify-start item-center'>
              <div className="flex space-x-20 text-sm  text-center font-bold item-center gap-x-2 select-none">
                MỤC TIÊU (PCS)
              </div>
              <div className="text-lg  text-center font-bold select-none">
                BIỂU ĐỒ THỂ HIỆN MỤC TIÊU GIỜ CỦA TỪNG CHUYỀN </div>
              <div className=" flex space-x-20 text-sm  text-center font-bold gap-x-2 select-none" >
              </div>
            </div>
            <Bar className='px-7'
              data={{
                labels: machines
                  .filter((machine) => machine.hourTarget !== 0)
                  .map((machine) => machine.name),
                datasets: [
                  {
                    label: 'Mục Tiêu Giờ',
                    data: machines
                      .filter((machine) => machine.hourTarget !== 0)
                      .map((machine) => machine.hourTarget),
                    backgroundColor: machines
                      .filter((machine) => machine.hourTarget !== 0)
                      .map((machine) =>
                        machine.hourTarget < 0 ? '#c40005' : '#00964d'
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
                      color: isDarkMode ? '#ffffff' : '#333333',
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
                    color: isDarkMode ? '#ffffff' : '#333333',
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
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      lineWidth: 1
                    },
                    ticks: {
                      font: {
                        weight: 'bold',
                        size: 14,
                      },
                      color: isDarkMode ? '#ffffff' : '#333333',
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
                      color: isDarkMode ? '#ffffff' : '#333333',
                    },
                    grid: {
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      lineWidth: 1
                    },
                    ticks: {
                      font: {
                        weight: 'bold',
                        size: 14,
                      },
                      color: isDarkMode ? '#ffffff' : '#333333',
                    },
                    min: Math.floor(
                      Math.min(0, Math.min(...machines.filter((machine) => machine.hourTarget !== 0).map((machine) => machine.hourTarget)) * 1.2) / 5
                    ) * 5,

                    max: Math.ceil(
                      Math.max(...machines.filter((machine) => machine.hourTarget !== 0).map((machine) => machine.hourTarget)) * 1.2 / 5
                    ) * 5,

                  },
                  y1: {
                    position: 'right',
                    display: true,
                    grid: {
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      lineWidth: 1
                    },
                    ticks: {
                      display: false,
                    },
                    min: Math.floor(
                      Math.min(0, Math.min(...machines.filter((machine) => machine.hourTarget !== 0).map((machine) => machine.hourTarget)) * 1.2) / 5
                    ) * 5,

                    max: Math.ceil(
                      Math.max(...machines.filter((machine) => machine.hourTarget !== 0).map((machine) => machine.hourTarget)) * 1.2 / 5
                    ) * 5,

                  },
                },
              }}
            />

          </div>



          {/* Biểu đồ Sản Lượng Thực Tế */}
          <div className={`flex-1 ${isDarkMode ? 'bg-[#1F2836] text-white' : 'bg-[#ffffff] text-black'} rounded-lg p-2 md:py-8 transition-transform shadow-[inset_0px_0px_4px_rgba(255,255,255,1)] ${isFullScreen ? "h-[40vh]" : "h-[34vh]"} `}>
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
                labels: filteredMachines.map((machine) => machine.name),
                datasets: [
                  showPerformance && {
                    label: 'Hiệu Suất',
                    data: filteredMachines.map((machine) => machine.performance),
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
                    data: filteredMachines.map((machine) => machine.actual),
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
                      color: isDarkMode ? '#ffffff' : '#333333',
                      font: {
                        size: 14,
                        weight: 'bold',
                      },
                    },
                  },
                ].filter(Boolean),
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1.5,
                scales: {
                  x: {
                    grid: {
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      lineWidth: 1
                    },
                    ticks: {
                      font: {
                        weight: 'bold',
                        size: 14,
                      },
                      color: isDarkMode ? '#ffffff' : '#333333',
                    },
                  },
                  y: {
                    stacked: true,
                    grid: {
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      lineWidth: 1
                    },
                    ticks: {
                      font: {
                        weight: 'bold',
                        size: 14,
                      },
                      color: isDarkMode ? '#ffffff' : '#333333',
                    },
                    min: 0,
                    max: 100,
                  },
                  y1: {
                    stacked: false,
                    position: 'right',
                    grid: {
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      lineWidth: 1
                    },
                    ticks: {
                      font: {
                        weight: 'bold',
                        size: 14,
                      },
                      color: isDarkMode ? '#ffffff' : '#333333',
                    },

                    min: 0,
                    max: Math.ceil(
                      Math.max(...filteredMachines.map((machine) => machine.actual)) * 1.2 / 50
                    ) * 50,
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const filteredIndex = context.dataIndex;
                        const machineName = filteredMachines[filteredIndex].name;

                        const performanceValue = filteredMachines[filteredIndex].performance || 0;
                        const actualValue = filteredMachines[filteredIndex].actual || 0;
                        const targetValue = filteredMachines[filteredIndex].dailyTarget || 0;
                        const remainValue = targetValue - actualValue;

                        // Hàm để căn chỉnh số
                        const padNumber = (num: number) => {
                          return num.toString().padStart(6, ' ');
                        };
                        const padNumber2 = (num: number) => {
                          return num.toString().padStart(7, ' ');
                        };
                        return [
                          `${machineName}:`,
                          `Hiệu suất:      ${padNumber(performanceValue)}%`,
                          `Thực hiện:      ${padNumber(actualValue)} PCS`,
                          `Còn lại:         ${padNumber2(remainValue)} PCS`
                        ];
                      },
                    },
                  },
                  datalabels: {
                    display: true,
                  },
                },
              }}
              plugins={[ChartDataLabels]}
            />

          </div>

        </div>

        <div className={` font-semibold flex space-x-20 justify-between p-0 py-2 ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>
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
                <div className={`h-5 w-5 rounded-full ${cpuData.connection ? 'bg-green-500' : 'bg-gray-500'}`} />
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
                  <div
                    key={machine.id}
                    className="block relative w-[calc(100%/5.08)] flex-shrink-0 hover:scale-[105%] transition-transform select-none "
                  >
                    <div
                      className={`py-8 rounded-2xl ${isDarkMode ? 'text-white' : 'text-black'} shadow-inner shadow-[inset_0px_0px_15px_rgba(255,255,255,0.8)] flex flex-col items-center justify-between ${!machine.isConnect
                        ? "bg-notConnect disabled shadow-[inset_0px_0px_4px_rgba(255,255,255,1)]"
                        : !machine.enable
                          ? "bg-gray-400 text-gray-200 opacity-30"
                          : "bg-connect shadow-[inset_0px_0px_4px_rgba(255,255,255,1)]"
                        }`}

                    >
                      <div className="text-xl md:text-2xl font-bold flex items-center justify-between w-full max-w-sm py-0 select-none">
                        <div className="text-center w-2/5 text-base md:text-3xl">{String(machine.id).padStart(2, "0")}</div>
                        <div className={`w-[2px] h-9 ${isDarkMode ? 'bg-white' : 'bg-black'}`}></div>
                        <div className="text-center w-3/5 text-base md:text-3xl">{machine.name}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-12 text-center mt-10 gap-x-0">
                        <div className="flex flex-col justify-center items-center">
                          <div className="font-bold text-md md:text-md select-none">MỤC TIÊU NGÀY</div>
                          <div className="text-md md:text-md select-none">(DAILY TARGET)</div>
                        </div>
                        <div className="text-4xl md:text-5xl font-bold select-none">{machine.dailyTarget}</div>

                        <div className="flex flex-col justify-center items-center">
                          <div className="font-bold text-md md:text-md select-none">MỤC TIÊU GIỜ</div>
                          <div className="text-md md:text-md select-none">(HOURLY TARGET)</div>
                        </div>
                        <div className="text-4xl md:text-5xl font-bold select-none">{machine.hourTarget}</div>

                        <div className={`flex flex-col justify-center items-center ${machine.is_Blink && machine.enable ? "blink" : ""}`}>
                          <div className="font-bold text-md md:text-md select-none">THỰC HIỆN</div>
                          <div className="text-md md:text-md select-none">(ACTUAL)</div>
                        </div>
                        <div className="text-4xl md:text-5xl font-bold select-none">
                          <span className={machine.is_Blink && machine.enable ? "blink" : ""}>{machine.actual}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}

          </div>





        </div>

        <div className={`${isDarkMode ? "text-white" : "text-[#333333]"} font-semibold flex flex-col justify-center items-center h-screen px-8 text-2xl relative`}>
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
            className={`absolute left-5 top-[50%] transform -translate-y-[50%] ${isDarkMode ? 'text-white border-white' : 'text-black border-black'} border-2 rounded-xl bg-transparent text-[#333333] text-2xl w-10 h-10 flex items-center justify-center hover:scale-[150%] transition-transform duration-300 z-10`}
          >
            &lt;
          </button>

          <button
            onClick={handleScrollNext}
            className={`absolute right-5 top-[50%] transform -translate-y-[50%] ${isDarkMode ? 'text-white border-white' : 'text-black border-black'} border-2 rounded-xl bg-transparent text-[#333333] text-2xl w-10 h-10 flex items-center justify-center hover:scale-[150%] transition-transform duration-300 z-10`}
          >
            &gt;
          </button>
        </div>






      </div >
    </>
  );
};

export default HomePage;
