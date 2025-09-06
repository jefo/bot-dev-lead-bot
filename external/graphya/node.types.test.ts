// src/domain/graph/node.types.test.ts
import { describe, it, expect } from 'bun:test';
import { createNode, NodeId } from './node.types';

describe('Node Types', () => {
  it('should create a Node with valid data', () => {
    const nodeId = 'a0000000-0000-4000-8000-00000000000a';
    const nodeName = 'TestNode';
    const nodeData = { key: 'value' };

    const node = createNode({
      id: nodeId,
      name: nodeName,
      data: nodeData,
    });

    expect(node.id).toBe(NodeId.create(nodeId).value);
    expect(node.name).toBe(nodeName);
    expect(node.path).toBe(`/${nodeName}`);
    expect(node.data).toEqual(nodeData);
    expect(node.metadata).toEqual({});
  });

  it('should create a Node with custom path', () => {
    const nodeId = 'a0000000-0000-4000-8000-00000000000a';
    const nodeName = 'TestNode';
    const nodePath = '/custom/path';
    const nodeData = 'simple string data';

    const node = createNode({
      id: nodeId,
      name: nodeName,
      path: nodePath,
      data: nodeData,
    });

    expect(node.id).toBe(NodeId.create(nodeId).value);
    expect(node.name).toBe(nodeName);
    expect(node.path).toBe(nodePath);
    expect(node.data).toBe(nodeData);
  });

  it('should create a Node with metadata', () => {
    const nodeId = 'a0000000-0000-4000-8000-00000000000a';
    const nodeName = 'TestNode';
    const nodeData = [1, 2, 3];
    const nodeMetadata = { createdAt: new Date().toISOString(), tags: ['tag1', 'tag2'] };

    const node = createNode({
      id: nodeId,
      name: nodeName,
      data: nodeData,
      metadata: nodeMetadata,
    });

    expect(node.id).toBe(NodeId.create(nodeId).value);
    expect(node.name).toBe(nodeName);
    expect(node.path).toBe(`/${nodeName}`);
    expect(node.data).toEqual(nodeData);
    expect(node.metadata).toEqual(nodeMetadata);
  });

  it('should throw an error for invalid node ID', () => {
    const invalidNodeId = 'invalid-uuid';
    const nodeName = 'TestNode';
    const nodeData = { key: 'value' };

    expect(() => {
      createNode({
        id: invalidNodeId,
        name: nodeName,
        data: nodeData,
      });
    }).toThrow();
  });

  it('should throw an error for empty node name', () => {
    const nodeId = 'a0000000-0000-4000-8000-00000000000a';
    const emptyNodeName = '';
    const nodeData = { key: 'value' };

    expect(() => {
      createNode({
        id: nodeId,
        name: emptyNodeName,
        data: nodeData,
      });
    }).toThrow();
  });
});