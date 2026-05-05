import React, { useEffect, useState, useCallback } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Tag, Tooltip, Popconfirm, message, Typography, Empty } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import {
  initTaskData,
  getTasks,
  saveTasks,
  TaskRecord,
  TaskStatus,
  isOverdue,
} from '@/services/TaskManagement';
import TaskFormModal from '@/pages/TaskManagement/components/TaskFormModal';
import '@/pages/TaskManagement/task.less';

const { Text } = Typography;


interface ColumnConfig {
  key: TaskStatus;
  label: string;
  cssClass: string;
  headerColor: string;
  countBg: string;
  dragOverBg: string;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'TODO',        label: '📋 Cần làm',      cssClass: 'col-todo',        headerColor: '#1677ff', countBg: '#e6f4ff', dragOverBg: 'rgba(22, 119, 255, 0.08)' },
  { key: 'IN_PROGRESS', label: '⚡ Đang làm',     cssClass: 'col-in-progress', headerColor: '#faad14', countBg: '#fffbe6', dragOverBg: 'rgba(250, 173, 20, 0.08)'  },
  { key: 'DONE',        label: '✅ Hoàn thành',   cssClass: 'col-done',        headerColor: '#52c41a', countBg: '#f6ffed', dragOverBg: 'rgba(82, 196, 26, 0.08)'   },
];

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: 'red',
  MEDIUM: 'orange',
  LOW: 'green',
};

const PRIORITY_LABEL: Record<string, string> = {
  HIGH: 'Cao',
  MEDIUM: 'TB',
  LOW: 'Thấp',
};


const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);

  useEffect(() => {
    initTaskData();
    setTasks(getTasks());
  }, []);

  const getColumnTasks = useCallback(
    (status: TaskStatus) => tasks.filter((t) => t.status === status),
    [tasks],
  );


  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceStatus = source.droppableId as TaskStatus;
    const destStatus = destination.droppableId as TaskStatus;

    const updated = [...tasks];
    const movingTaskIdx = updated.findIndex((t) => t.taskId === draggableId);
    if (movingTaskIdx === -1) return;

    const movingTask: TaskRecord = { ...updated[movingTaskIdx], status: destStatus };
    updated.splice(movingTaskIdx, 1); // remove from old position

    const destColTasks = updated.filter((t) => t.status === destStatus);
    const destColTaskIds = destColTasks.map((t) => t.taskId);

    if (destination.index >= destColTasks.length) {

      updated.push(movingTask);
    } else {

      const anchorId = destColTaskIds[destination.index];
      const anchorIdx = updated.findIndex((t) => t.taskId === anchorId);
      updated.splice(anchorIdx, 0, movingTask);
    }

    setTasks(updated);
    saveTasks(updated);

    if (sourceStatus !== destStatus) {
      const destLabel = COLUMNS.find((c) => c.key === destStatus)?.label ?? destStatus;
      message.success(`Task đã chuyển sang "${destLabel}"`);
    }
  };


  const handleCreate = (defaultStatus?: TaskStatus) => {
    setEditingTask(
      defaultStatus
        ? ({ status: defaultStatus } as any)
        : null,
    );
    setFormVisible(true);
  };

  const handleEdit = (task: TaskRecord) => {
    setEditingTask(task);
    setFormVisible(true);
  };

  const handleDelete = (taskId: string) => {
    const updated = tasks.filter((t) => t.taskId !== taskId);
    setTasks(updated);
    saveTasks(updated);
    message.success('Đã xóa task');
  };

  const handleFormOk = (task: TaskRecord) => {
    const exists = tasks.some((t) => t.taskId === task.taskId);
    const updated = exists
      ? tasks.map((t) => (t.taskId === task.taskId ? task : t))
      : [...tasks, task];
    setTasks(updated);
    saveTasks(updated);
    message.success(exists ? 'Đã cập nhật task' : 'Đã thêm task mới');
    setFormVisible(false);
    setEditingTask(null);
  };

  const handleFormCancel = () => {
    setFormVisible(false);
    setEditingTask(null);
  };


  return (
    <PageContainer
      title="Bảng Kanban"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="tm-btn-primary"
          onClick={() => handleCreate()}
        >
          Thêm Task
        </Button>
      }
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="tm-kanban-wrapper">
          {COLUMNS.map((col) => {
            const colTasks = getColumnTasks(col.key);
            return (
              <div key={col.key} className={`tm-kanban-column ${col.cssClass}`}>

                <div className="tm-column-header">
                  <span className="col-title" style={{ color: col.headerColor }}>
                    {col.label}
                  </span>
                  <span className="col-count" style={{ background: col.countBg, color: col.headerColor }}>
                    {colTasks.length}
                  </span>
                </div>


                <Droppable droppableId={col.key}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={[
                        'tm-column-body',
                        snapshot.isDraggingOver ? 'is-dragging-over' : '',
                      ].join(' ')}
                      style={{
                        background: snapshot.isDraggingOver ? col.dragOverBg : undefined,
                        borderRadius: 10,
                        transition: 'background 0.25s ease',
                        padding: '4px 2px 2px',
                        minHeight: 200,
                      }}
                    >
                      {colTasks.length === 0 && !snapshot.isDraggingOver && (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="Không có task"
                          style={{ margin: '24px 0' }}
                        />
                      )}

                      {colTasks.map((task, index) => {
                        const overdue = isOverdue(task);
                        return (
                          <Draggable
                            key={task.taskId}
                            draggableId={task.taskId}
                            index={index}
                          >
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                className={[
                                  'tm-task-card',
                                  `card-${task.status.toLowerCase().replace('_', '-')}`,
                                  snap.isDragging ? 'is-dragging' : '',
                                  overdue ? 'overdue-card' : '',
                                ].join(' ')}
                                style={{
                                  ...prov.draggableProps.style,
                                  background: '#fff',
                                  padding: '12px 14px',
                                }}
                              >
                                <div className="tm-card-title">{task.title}</div>

                                {task.description && (
                                  <div className="tm-card-desc">{task.description}</div>
                                )}

                                {task.tags.length > 0 && (
                                  <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                    {task.tags.map((tag) => (
                                      <Tag key={tag} style={{ fontSize: 10, margin: 0, lineHeight: '18px', padding: '0 5px' }}>
                                        {tag}
                                      </Tag>
                                    ))}
                                  </div>
                                )}

                                <div className="tm-card-footer">
                                  <span className={`tm-card-deadline${overdue ? ' overdue' : ''}`}>
                                    <ClockCircleOutlined />
                                    {overdue ? '⚠ ' : ''}
                                    {new Date(task.deadline).toLocaleDateString('vi-VN')}
                                  </span>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Tag
                                      color={PRIORITY_COLOR[task.priority]}
                                      style={{ margin: 0, fontSize: 10, padding: '0 5px' }}
                                    >
                                      {PRIORITY_LABEL[task.priority]}
                                    </Tag>
                                    <div className="tm-card-actions">
                                      <Tooltip title="Chỉnh sửa">
                                        <EditOutlined
                                          style={{ fontSize: 13, color: '#1677ff', cursor: 'pointer' }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(task);
                                          }}
                                        />
                                      </Tooltip>
                                      <Popconfirm
                                        title="Xóa task này?"
                                        okText="Xóa"
                                        cancelText="Hủy"
                                        onConfirm={(e) => {
                                          e?.stopPropagation();
                                          handleDelete(task.taskId);
                                        }}
                                        onCancel={(e) => e?.stopPropagation()}
                                      >
                                        <DeleteOutlined
                                          style={{ fontSize: 13, color: '#ff4d4f', cursor: 'pointer' }}
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </Popconfirm>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>


                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  block
                  style={{ marginTop: 8, borderRadius: 8, color: col.headerColor, borderColor: col.headerColor }}
                  onClick={() => handleCreate(col.key)}
                >
                  Thêm task
                </Button>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <TaskFormModal
        visible={formVisible}
        editingTask={editingTask}
        onOk={handleFormOk}
        onCancel={handleFormCancel}
      />
    </PageContainer>
  );
};

export default KanbanBoard;
