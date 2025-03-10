"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { pluginStore } from "@/lib/goat-plugins/pluginStore";

interface PluginStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  plugins: string[];
  onPluginUpdate: (plugins: string[]) => void;
}

function PluginStoreModal({ isOpen, onClose, plugins, onPluginUpdate }: PluginStoreModalProps) {
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>(plugins);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  // Get unique categories from plugin store
  const categories = ['all', ...Array.from(new Set(pluginStore.map(plugin => plugin.category)))];

  // Filter plugins based on search and category
  const filteredPlugins = pluginStore.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTogglePlugin = (pluginId: string) => {
    setSelectedPlugins(prev => {
      if (prev.includes(pluginId)) {
        return prev.filter(id => id !== pluginId);
      }
      return [...prev, pluginId];
    });
  };

  const handleSave = () => {
    onPluginUpdate(selectedPlugins);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Plugin Store</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search plugins..."
            className="flex-1 px-3 py-2 bg-background border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-background border rounded-md"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 gap-4">
            {filteredPlugins.map((plugin) => (
              <div
                key={plugin.id}
                className={`flex items-center space-x-4 p-4 rounded-lg border hover:bg-gray-900 cursor-pointer ${
                  selectedPlugins.includes(plugin.id) ? 'border-primary bg-background' : 'border-border'
                }`}
                onClick={() => handleTogglePlugin(plugin.id)}
              >
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-lg text-xl">
                  {plugin.icon}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{plugin.name}</h4>
                    {selectedPlugins.includes(plugin.id) && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{plugin.description}</p>
                  <div className="mt-1">
                    <span className="text-xs px-2 py-0.5 rounded">
                      {plugin.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PluginStoreModal; 