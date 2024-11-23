"use client";

import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
import { useEffect, useState } from "react";
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

const HomePage = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [cpuData, setCpuData] = useState<CpuData | null>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null); // Thêm state để lưu thông tin máy khi bấm vào card

  const [showPerformance, setShowPerformance] = useState(true);
  const [showActual, setShowActual] = useState(true);

  const [isFullScreen, setIsFullScreen] = useState(false);


  const fetchMachineData = async () => {
    try {
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 5000);

      const response = await fetch("/api/machines");
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("API response not ok");
      }

      const data = await response.json();
      const updatedMachines = data.map((machine: Machine) => ({
        ...machine,
        enable: machine.isConnect ? machine.enable : false, // Disable nếu không kết nối
        dailyTarget: machine.isConnect && machine.enable ? machine.dailyTarget : 0, // Mục tiêu ngày = 0 nếu không kích hoạt
        hourTarget: machine.isConnect && machine.enable ? machine.hourTarget : 0, // Mục tiêu giờ = 0 nếu không kích hoạt
        actual: machine.isConnect && machine.enable ? machine.actual : 0, // Thực hiện = 0 nếu không kích hoạt
        performance: machine.isConnect && machine.enable ? machine.performance : 0,
      }));
      setMachines(updatedMachines);
      if (isLoading) setIsLoading(false);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      setIsLoading(false);
    }
  };

  const fetchCpuData = async () => {
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
  };

  // Kiểm tra trạng thái toàn màn hình
  const checkFullScreen = () => {
    const isFullScreenNow = window.innerHeight === screen.height;
    console.log(window.innerHeight);
    console.log(screen.height);
    if (isFullScreenNow) {
      console.log("Chế độ toàn màn hình");
      setIsFullScreen(true);
    } else {
      console.log("Chế độ bình thường");
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    fetchMachineData();
    fetchCpuData();
    const intervalId = setInterval(() => {
      fetchMachineData();
      fetchCpuData();
      document.addEventListener("fullscreenchange", checkFullScreen);
      // Kiểm tra ngay khi component load
      checkFullScreen();
    }, 1000);


    return () => {
      clearInterval(intervalId);
      document.removeEventListener("fullscreenchange", checkFullScreen);

    };
  }, []);

  useEffect(() => {
    const autoScrollInterval = setInterval(() => {
      setScrollIndex((prevIndex) => {
        const maxScrollIndex = Math.ceil(machines.length / 5) - 1;
        return prevIndex < maxScrollIndex ? prevIndex + 1 : 0;
      });
    }, 10000); // Scroll every 5 seconds

    return () => {
      clearInterval(autoScrollInterval); // Cleanup on component unmount
    };
  }, [machines.length]);

  const enabledCount = machines.filter((machine) => machine.enable || (!machine.isConnect)).length;
  const idCount = machines.filter((machine) => machine.id).length;

  const openModal = (machine: Machine) => {
    setSelectedMachine(machine); // Khi bấm vào card, lưu thông tin máy vào state
  };

  const closeModal = () => {
    setSelectedMachine(null); // Đóng modal
  };

  const handleScrollNext = () => {
    // Tính toán số lần cuộn tối đa
    const maxScrollIndex = Math.ceil(machines.length / 5) - 1;

    // Chỉ cuộn nếu chưa đến cuối danh sách
    if (scrollIndex < maxScrollIndex) {
      setScrollIndex(scrollIndex + 1);
    }
    else {
      setScrollIndex(0);
    }
  };

  const handleScrollPrev = () => {
    const maxScrollIndex = Math.ceil(machines.length / 5) - 1;
    // Chỉ cuộn nếu chưa đến đầu danh sách
    if (scrollIndex > 0) {
      setScrollIndex(scrollIndex - 1);
    }
    else {
      setScrollIndex(maxScrollIndex);
    }
  };

  const filteredMachines = machines.filter(
    (machine) => machine.performance !== 0 && machine.actual !== 0
  );

  return (
    <div className="p-2.5 overflow-hidden relative flex flex-col justify-between w-full">
      <div className="flex justify-between gap-10 py-2 scale-[100%]">
        <div className={`flex-1 bg-[#ffffff] p-2 md:py-8 transition-transform shadow-[0px_4px_8px_rgba(0,0,0,0.8)] rounded-lg ${isFullScreen ? "h-[40vh]" : "h-[34vh]"} `}>
          <div className='flex space-x-20 justify-start item-center'>
            <div className="flex space-x-20 text-sm text-[#333333] text-center font-bold item-center gap-x-2">
              MỤC TIÊU (PCS)
            </div>
            <div className="text-lg text-[#333333] text-center font-bold ">
              BIỂU ĐỒ THỂ HIỆN MỤC TIÊU GIỜ CỦA TỪNG CHUYỀN            </div>
            <div className=" flex space-x-20 text-sm text-[#333333] text-center font-bold gap-x-2" >
            </div>
          </div>
          <Bar className='px-7'
            data={{
              labels: machines
                .filter((machine) => machine.hourTarget !== 0) // Lọc bỏ các máy có hourTarget = 0
                .map((machine) => machine.name),
              datasets: [
                {
                  label: 'Mục Tiêu Giờ',
                  data: machines
                    .filter((machine) => machine.hourTarget !== 0) // Lọc bỏ các máy có hourTarget = 0
                    .map((machine) => machine.hourTarget),
                  backgroundColor: machines
                    .filter((machine) => machine.hourTarget !== 0) // Lọc bỏ các máy có hourTarget = 0
                    .map((machine) =>
                      machine.hourTarget < 0 ? '#f42429' : '#34d089' // Chọn màu cho giá trị âm và dương
                    ),
                  borderColor: '#111111',
                  borderWidth: 1,
                  barThickness: 50,
                  borderRadius: 5,
                  yAxisID: 'y1', // Gắn dữ liệu này vào trục y1
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
                    color: '#333333',
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
                  color: '#000000',
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
                  ticks: {
                    font: {
                      weight: 'bold',
                      size: 14,
                    },
                    color: '#333333',
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
                    color: '#333333',
                  },
                  ticks: {
                    font: {
                      weight: 'bold',
                      size: 14,
                    },
                    color: '#333333',
                  },
                  min: Math.floor(
                    Math.min(0, Math.min(...machines.filter((machine) => machine.hourTarget !== 0).map((machine) => machine.hourTarget)) * 1.2) / 5
                  ) * 5,

                  max: Math.ceil(
                    Math.max(...machines.filter((machine) => machine.hourTarget !== 0).map((machine) => machine.hourTarget)) * 1.2 / 5
                  ) * 5,

                },
                y1: {
                  position: 'right', // Vị trí trục y1 bên phải
                  display: true, // Ẩn trục y1 hoàn toàn
                  ticks: {
                    display: false, // Không hiển thị giá trị ticks
                  },
                  grid: {
                    drawOnChartArea: false, // Không vẽ đường kẻ lưới cho trục y1
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
        <div className={`flex-1 bg-[#ffffff] rounded-lg p-2 md:py-8 transition-transform shadow-[0px_4px_8px_rgba(0,0,0,0.8)] ${isFullScreen ? "h-[40vh]" : "h-[34vh]"} `}>
          <div className='flex space-x-20 justify-between item-center' >
            <div className="flex space-x-20 text-sm text-[#333333] text-center font-bold item-center gap-x-2" onClick={() => setShowPerformance((prev) => !prev)}>
              HIỆU SUẤT (%)
              <div className={`h-5 w-5 rounded-lg bg-[#ff6347] `} />
            </div>
            <div className="text-lg text-[#333333] text-center font-bold">
              BIỂU ĐỒ HIỆU SUẤT VÀ THỰC HIỆN
            </div>
            <div className=" flex space-x-20 text-sm text-[#333333] text-center font-bold gap-x-2" onClick={() => setShowActual((prev) => !prev)}>
              <div className={`h-5 w-5 rounded-lg bg-[#33cde5]`} />
              THỰC HIỆN (PCS)

            </div></div>

          <Bar className='px-7'
            data={{
              // Sử dụng danh sách máy đã lọc
              labels: filteredMachines.map((machine) => machine.name),
              datasets: [
                showPerformance && {
                  label: 'Hiệu Suất',
                  data: filteredMachines.map((machine) => machine.performance),
                  borderColor: '#ff6347',
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
                    font: {
                      size: 14,
                      weight: 'bold',
                    },
                  },
                },
              ].filter(Boolean), // Loại bỏ dataset không cần thiết
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              aspectRatio: 1.5,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      const filteredIndex = context.dataIndex; // Lấy chỉ số của máy trong danh sách đã lọc
                      const machineName = filteredMachines[filteredIndex].name; // Tên máy từ danh sách đã lọc

                      const performanceValue = filteredMachines[filteredIndex].performance || 0;
                      const actualValue = filteredMachines[filteredIndex].actual || 0;
                      const targetValue = filteredMachines[filteredIndex].dailyTarget || 0;
                      const remainValue = targetValue - actualValue;
                      return `${machineName}: - Hiệu suất: ${performanceValue}%, Thực Hiện: ${actualValue} PCS. Còn lại:  ${remainValue} PCS`;
                    },
                  },
                },
                datalabels: {
                  display: true,
                },
              },
              scales: {
                x: {
                  ticks: {
                    font: {
                      weight: 'bold',
                      size: 14,
                    },
                    color: '#333333',
                  },
                },
                y: {
                  stacked: true,
                  ticks: {
                    font: {
                      weight: 'bold',
                      size: 14,
                    },
                    color: '#333333',
                  },
                  min: 0,
                  max: 100,
                },
                y1: {
                  stacked: false,
                  position: 'right',
                  ticks: {
                    font: {
                      weight: 'bold',
                      size: 14,
                    },
                    color: '#333333',
                  },
                  grid: {
                    drawOnChartArea: false,
                  },
                  min: 0,
                  max: Math.ceil(
                    Math.max(...filteredMachines.map((machine) => machine.actual)) * 1.2 / 50
                  ) * 50,
                },
              },
            }}
            plugins={[ChartDataLabels]}
          />

        </div>

      </div>

      <div className="text-[#333333] font-semibold flex space-x-20 justify-between p-0 py-2">
        <div className=' flex justify-start'>
          <div>
            Số Line đang hoạt động: {enabledCount}/{idCount}
          </div>
        </div>
        <div className='justify-end'>
          {cpuData && (
            <div className="flex items-center space-x-3">
              <div>
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
              <div className="text-center text-[#333333] text-xl md:text-3xl h-[30vh] ml-[80vh]">
                Mất kết nối
              </div>
            ) : (
              machines.map((machine) => (
                <div
                  key={machine.id}
                  onClick={() => openModal(machine)}
                  className="block relative w-[calc(100%/5.08)] flex-shrink-0 cursor-pointer hover:scale-[105%] transition-transform select-none "
                >
                  <div
                    className={`py-8 rounded-2xl shadow-inner shadow-[inset_0px_0px_15px_rgba(255,255,255,0.8)] flex flex-col items-center justify-between ${!machine.isConnect
                      ? "bg-[#f42429] text-gray-200 disabled"
                      : !machine.enable
                        ? "bg-gray-400 text-gray-200 opacity-30"
                        : "bg-[#34d089] text-white"
                      }`}

                  >

                    <div className="text-xl md:text-2xl font-bold flex items-center justify-between w-full max-w-sm py-0">
                      <div className="text-center w-2/5 text-base md:text-3xl">{String(machine.id).padStart(2, "0")}</div>
                      <div className={`w-[2px] h-9 bg-white`}></div>
                      <div className="text-center w-3/5 text-base md:text-3xl">{machine.name}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-12 text-center mt-10 gap-x-0">
                      <div className="flex flex-col justify-center items-center">
                        <div className="font-bold text-md md:text-md">MỤC TIÊU NGÀY</div>
                        <div className="text-md md:text-md">(DAILY TARGET)</div>
                      </div>
                      <div className="text-4xl md:text-5xl font-bold ">{machine.dailyTarget}</div>

                      <div className="flex flex-col justify-center items-center">
                        <div className="font-bold text-md md:text-md">MỤC TIÊU GIỜ</div>
                        <div className="text-md md:text-md">(HOURLY TARGET)</div>
                      </div>
                      <div className="text-4xl md:text-5xl font-bold ">{machine.hourTarget}</div>

                      <div className={`flex flex-col justify-center items-center ${machine.is_Blink && machine.enable ? "blink" : ""}`}>
                        <div className="font-bold text-md md:text-md">THỰC HIỆN</div>
                        <div className="text-md md:text-md">(ACTUAL)</div>
                      </div>
                      <div className="text-4xl md:text-5xl font-bold ">
                        <span className={machine.is_Blink && machine.enable ? "blink" : ""}>{machine.actual}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )
          )}

        </div>


        {/* Nút cuộn tiếp theo */}
        <button
          onClick={handleScrollNext} // Sửa lại hàm này
          className="absolute right-2 bottom-2 transform border-2 border-black rounded-xl bg-transparent text-[#333333] text-2xl w-10 h-10 flex items-center justify-center hover:scale-[150%] transition-transform duration-300 z-10"
        >
          &gt;
        </button>

        {/* Nút cuộn trước */}
        <button
          onClick={handleScrollPrev} // Sửa lại hàm này
          className="absolute left-2 bottom-2 transform border-2 border-black rounded-xl bg-transparent text-[#333333] text-2xl w-10 h-10 flex items-center justify-center hover:scale-[150%] transition-transform duration-300 z-10"
        >
          &lt;
        </button>


      </div>

      <div className="text-[#333333] font-semibold flex space-x-20 justify-center px-8 pt-7 text-2xl">
        <div className='space-x-20 flex'>
          <div className="flex items-center space-x-2">
            <div>
              Có Kết Nối
            </div>
            <div className={`h-5 w-5 rounded-lg bg-[#34d089]`} />
          </div>
          <div className="flex items-center space-x-2">
            <div>
              Không Hoạt Động
            </div>
            <div className={`h-5 w-5 rounded-lg bg-gray-400`} />
          </div>
          <div className="flex items-center space-x-2">
            <div>
              Mất Kết Nối
            </div>
            <div className={`h-5 w-5 rounded-lg bg-[#f42429]`} />
          </div>
        </div>
      </div>
      {/* Modal */}
      {
        selectedMachine && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-20 text-black"
            onClick={() => closeModal()} // Đóng modal khi nhấn ra ngoài modal
          >
            {/* Modal content */}
            <div
              className="bg-white rounded-lg p-8 w-96"
              onClick={(e) => e.stopPropagation()} // Ngừng sự kiện click khi nhấn vào nội dung modal
            >
              <h2 className="text-2xl font-semibold">Thông Tin Line</h2>

              {/* Form for updating machine information */}
              <div className="mt-4">
                <p><strong>ID:</strong> {selectedMachine.id}</p>

                {/* Input for name */}
                <div className="mt-2">
                  <label className="block text-sm font-semibold">Tên:</label>
                  <input
                    type="text"
                    value={selectedMachine.name}
                    onChange={(e) => setSelectedMachine({ ...selectedMachine, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Input for dailyTarget */}
                <div className="mt-2">
                  <label className="block text-sm font-semibold">Mục Tiêu Ngày:</label>
                  <input
                    type="number"
                    value={selectedMachine.dailyTarget}
                    onChange={(e) => setSelectedMachine({ ...selectedMachine, dailyTarget: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Enable toggle */}
                <div className="mt-2 flex items-center justify-end">
                  <label className="block text-sm font-semibold mr-2">Kích Hoạt:</label>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={selectedMachine.enable}
                      onChange={() => setSelectedMachine({ ...selectedMachine, enable: !selectedMachine.enable })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-4 flex gap-4 justify-end">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/machines/${selectedMachine.id}`, {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          newName: selectedMachine.name,
                          newDailyTarget: selectedMachine.dailyTarget,
                          newEnable: selectedMachine.enable,
                        }),
                      });

                      if (!response.ok) {
                        throw new Error('Failed to update machine');
                      }

                      const updatedMachine = await response.json();
                      setMachines((prevMachines) =>
                        prevMachines.map((machine) =>
                          machine.id === updatedMachine.id ? updatedMachine : machine
                        )
                      );
                      closeModal();
                    } catch (error) {
                      console.error(error);
                    }
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Cập Nhật
                </button>

                <button
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )
      }


    </div >
  );
};

export default HomePage;
