const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.user.toString() !== req.userId) {
      return res.status(404).json({ message: "Notificação não encontrada" });
    }
    notification.read = true;
    await notification.save();
    res.json({ message: "Notificação marcada como lida" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.userId, read: false }, { read: true });
    res.json({ message: "Todas as notificações marcadas como lidas" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.user.toString() !== req.userId) {
      return res.status(404).json({ message: "Notificação não encontrada" });
    }
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Notificação deletada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};