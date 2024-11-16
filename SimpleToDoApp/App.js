import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  Animated
} from 'react-native';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Add new task with fade-in animation
  const addTask = () => {
    if (task.trim()) {
      const newTask = {
        id: Date.now().toString(),
        text: task,
        completed: false,
        slideAnim: new Animated.Value(300), // Start position (off-screen to the right)
        opacityAnim: new Animated.Value(0),  // Start as invisible
      };

      // Slide in and fade in animation
      Animated.parallel([
        Animated.spring(newTask.slideAnim, {
          toValue: 0, // Move to the left side
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(newTask.opacityAnim, {
          toValue: 1, // Fade in
          duration: 5000, // Fade in duration is now 5 seconds
          useNativeDriver: true,
        }),
      ]).start();

      setTasks([...tasks, newTask]);
      setTask('');
    }
  };

  // Delete task with fade-out animation
  const deleteTask = (taskId) => {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    const taskToDelete = tasks[taskIndex];

    // Fade out animation
    Animated.timing(taskToDelete.opacityAnim, {
      toValue: 0, // Fade out
      duration: 5000, // Fade out duration is now 5 seconds
      useNativeDriver: true,
    }).start();

    // After the animation, remove the task from the list
    setTimeout(() => {
      setTasks(tasks.filter((item) => item.id !== taskId));
    }, 5000); // Wait for the fade-out animation to complete before removing the task
  };

  // Toggle task completion
  const toggleComplete = (taskId) => {
    setTasks(tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
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

    // Find the task to edit
    const taskToEdit = updatedTasks.find(task => task.id === editingTaskId);

    // Reset the slide animation to its off-screen position
    taskToEdit.slideAnim.setValue(300); // Reset slide position to off-screen to the right

    // Apply slide-in effect when saving edited task
    Animated.timing(taskToEdit.slideAnim, {
      toValue: 0, // Move to the normal position
      duration: 500, // Adjust duration for slide-in
      useNativeDriver: true,
    }).start();

    // Apply fade-in for the task
    Animated.timing(taskToEdit.opacityAnim, {
      toValue: 1, // Ensure it fades in
      duration: 500, // Adjust duration for fade-in
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
        <TouchableOpacity style={styles.addButton} onPress={editingTaskId ? saveTask : addTask}>
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
                transform: [{ translateX: item.slideAnim }], // Apply slide animation
                opacity: item.opacityAnim, // Apply fade-in/fade-out animation
              }
            ]}
          >
            <TouchableOpacity onPress={() => startEditing(item.id, item.text)}>
              <Text
                style={[
                  styles.taskText,
                  item.completed && {
                    color: '#888',
                    textTransform: 'uppercase',
                    textShadowColor: '#3A6EA5',
                    textShadowOffset: { width: 1, height: 1 },
                    textShadowRadius: 3,
                  }
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
