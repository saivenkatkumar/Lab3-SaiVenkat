import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Load tasks from AsyncStorage on app start
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks).map((task) => ({
            ...task,
            slideAnim: new Animated.Value(0),
            opacityAnim: new Animated.Value(1),
          }));
          setTasks(parsedTasks);
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    };

    loadTasks();
  }, []);

  // Save tasks to AsyncStorage whenever tasks change
  useEffect(() => {
    const saveTasks = async () => {
      try {
        const serializableTasks = tasks.map(({ slideAnim, opacityAnim, ...task }) => task);
        await AsyncStorage.setItem('tasks', JSON.stringify(serializableTasks));
      } catch (error) {
        console.error('Failed to save tasks:', error);
      }
    };

    saveTasks();
  }, [tasks]);

  // Add new task with fade-in animation
  const addTask = () => {
    if (task.trim()) {
      const newTask = {
        id: Date.now().toString(),
        text: task,
        completed: false,
        slideAnim: new Animated.Value(300),
        opacityAnim: new Animated.Value(0),
      };

      Animated.parallel([
        Animated.spring(newTask.slideAnim, {
          toValue: 0,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(newTask.opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      setTasks([...tasks, newTask]);
      setTask('');
    }
  };

  // Delete task with fade-out animation
  const deleteTask = (taskId) => {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    const taskToDelete = tasks[taskIndex];

    Animated.timing(taskToDelete.opacityAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      setTasks(tasks.filter((item) => item.id !== taskId));
    }, 500);
  };

  // Toggle task completion
  const toggleComplete = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Start editing the task
  const startEditing = (taskId, taskText) => {
    setEditingTaskId(taskId);
    setTask(taskText);
  };

  // Save edited task with slide-in animation
  const saveTask = () => {
    const updatedTasks = tasks.map((taskItem) =>
      taskItem.id === editingTaskId ? { ...taskItem, text: task } : taskItem
    );

    const taskToEdit = updatedTasks.find((task) => task.id === editingTaskId);
    taskToEdit.slideAnim.setValue(300);

    Animated.timing(taskToEdit.slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.timing(taskToEdit.opacityAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    setTasks(updatedTasks);
    setEditingTaskId(null);
    setTask('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={editingTaskId ? saveTask : addTask}
        >
          <Text style={styles.addButtonText}>{editingTaskId ? '✓' : '+'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <Animated.View
            style={[
              styles.taskContainer,
              item.completed && {
                borderStyle: 'dotted',
                borderWidth: 2,
                borderColor: '#FFA580',
              },
              {
                transform: [{ translateX: item.slideAnim }],
                opacity: item.opacityAnim,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => startEditing(item.id, item.text)}
            >
              <Text
                style={[
                  styles.taskText,
                  item.completed && {
                    color: '#888',
                    textTransform: 'uppercase',
                    textShadowColor: '#3A6EA5',
                    textShadowOffset: { width: 1, height: 1 },
                    textShadowRadius: 3,
                  },
                ]}
              >
                {item.text}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleComplete(item.id)}>
              <Text style={styles.completeButton}>
                {item.completed ? 'InComplete' : 'Complete'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.deleteButton}>X</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    marginBottom: 10,
    borderRadius: 5,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  completeButton: {
    color: '#FFA500',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    color: '#FF5C5C',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
