import { Block, Channel } from "./arena"
import { mut } from "./solid_monke/solid_monke"

type CanvasNode = CanvasGroup | CanvasBlock | CanvasChannel

export type CanvasPolyline = {
  id: number
  class: 'Path'
  base_class: 'Path'
  points: Position[]
}

type DependentPosition = {
  id: number
  base_class: 'Block' | 'Channel' | 'Group'
  from: 'top' | 'bottom' | 'left' | 'right'
}

type CanvasGroup = {
  id: number
  class: 'Group'
  base_class: 'Group'
  x: number
  y: number
  width: number
  height: number
  children: number[]
}

type CanvasBlock = {
  id: number
  class: 'Image' | 'Text' | 'Link' | 'Media' | 'Attachment'
  base_class: 'Block'
  x: number
  y: number
  width: number
  height: number
  children: number[]
  source: Block
}

type CanvasChannel = {
  id: number
  class: 'Channel'
  base_class: 'Channel'
  x: number
  y: number
  width: number
  height: number
  children: number[]
  source: Channel
}

type Position = {
  x: number
  y: number
}

type Dimension = {
  width: number
  height: number
}

export class CanvasStore {
  contents: CanvasNode[]
  lines: CanvasPolyline[] = []
  max_x = 2500
  default_width = 300
  default_height = 300

  constructor() {
    this.contents = []
    this.lines.push(mut({
      id: 1,
      class: 'Path',
      base_class: 'Path',
      points: mut({ list: [{ x: 250, y: 500 }, { x: 100, y: 150 }, { x: 350, y: 100 }, { x: 200, y: 500 }] }),
    }))
  }

  add_line(points: Position[], _id?: number,) {
    if (points.length == 1) {
      points.push({ x: points[0].x + 100, y: points[0].y + 100 })
    }

    let id = _id ? _id : this.lines.length + 1

    this.lines.push(mut({
      id: id,
      class: 'Path',
      base_class: 'Path',
      points: mut({ list: points }),
    }))

  }

  add_point_to_line(line_id: number, point?: Position) {
    const line = this.lines.find(line => line.id === line_id)
    if (!line) return
    if (point) {
      line.points.push(point)
    } else {
      console.log(line)
      let p = line.points.list[line.points.list.length - 1]
      console.log(p)
      if (!p) return
      line.points.list.push({ x: p.x + 50, y: p.y + 50 })
    }

  }

  check_if_node_exists(id: number): boolean {
    return this.contents.every(node => node.id !== id)
  }

  get_position_after_previous(): Position {
    const last_node = this.contents[this.contents.length - 1]
    if (last_node === undefined) { return { x: 0, y: 0 } }

    const x = last_node.x + last_node.width + 10
    const y = last_node.y

    if (x > this.max_x) {
      return { x: 0, y: y + last_node.height + 10 }
    } else {
      return { x: x, y: y }
    }
  }

  add_block_as_node(block: Block, position?: Position, dimension?: Dimension): CanvasNode | undefined {
    if (this.check_if_node_exists(block.id)) {
      const pos = position ? position : this.get_position_after_previous()
      const dim = dimension ? dimension : { width: this.default_width, height: this.default_height }

      const node: CanvasNode = {
        id: block.id,
        class: block.class,
        base_class: "Block",
        x: pos.x,
        y: pos.y,
        width: dim.width,
        height: dim.height,
        children: [],
        source: block
      }
      this.contents.push(node)
      return node
    }
  }

  add_channel_as_node(channel: Channel, position?: Position): CanvasNode | undefined {
    if (this.check_if_node_exists(channel.id)) {
      const pos = position ? position : this.get_position_after_previous()
      const node: CanvasNode = {
        id: channel.id,
        class: 'Channel',
        base_class: 'Channel',
        x: pos.x,
        y: pos.y,
        width: this.default_width,
        height: this.default_height,
        children: [],
        source: channel
      }

      this.contents.push(node)
      return node
    }
  }

  add_group_as_node(id: number, children: number[], position: Position, dimension: Dimension): CanvasNode | undefined {
    if (this.check_if_node_exists(id)) {
      const node: CanvasNode = {
        id: id,
        class: 'Group',
        base_class: 'Group',
        x: position.x,
        y: position.y,
        width: dimension.width,
        height: dimension.height,
        children: children,
      }

      this.contents.push(node)
      return node
    }
  }

  remove_group(id: number) {
    // give children position of group + their own position
    let group = this.get_node(id)
    let children = group ? group.children : []
    let group_position = this.get_position(id)

    if (!group_position) return

    children.forEach(child_id => {
      let child = this.get_node(child_id)
      if (child) {
        child.x = child.x + group_position.x
        child.y = child.y + group_position.y
      }
    })

    this.contents = this.contents.filter(node => node.id !== id)
  }

  get_node(id: number): CanvasNode | undefined {
    return this.contents.find(node => node.id === id)
  }

  get_children(id: number): CanvasNode[] {
    return this.contents.filter(node => node.children ? node.children.includes(id) : false)
  }

  get_position(id: number): Position | undefined {
    const node = this.get_node(id)
    if (node) {
      return { x: node.x, y: node.y }
    }
  }

  check_if_node_in_group(node_id: number): CanvasGroup | undefined {
    let returning_group: CanvasGroup | undefined
    this.contents.forEach(node => {
      if (node.class === 'Group') {
        const group = node
        if (group.children.includes(node_id)) {
          returning_group = group
        }
      }
    })
    return returning_group
  }

  get_global_position(id: number): Position | undefined {
    // will check if the node exists in group, and if it does then add group's position to the node's position
    const node = this.get_node(id)
    if (node) {
      const group = this.check_if_node_in_group(id)
      if (group) {
        console.log('is in a group', group)
        return { x: node.x + group.x, y: node.y + group.y }
      } else {
        return { x: node.x, y: node.y }
      }
    }
  }

  get_dimensions(id: number): Dimension | undefined {
    const node = this.get_node(id)
    if (node) {
      return { width: node.width, height: node.height }
    }
  }

  get_box(id: number): { top: number, left: number, right: number, bottom: number } | undefined {
    const position = this.get_global_position(id)
    const dimensions = this.get_dimensions(id)

    if (position && dimensions) {
      return {
        top: position.y,
        left: position.x,
        right: position.x + dimensions.width,
        bottom: position.y + dimensions.height
      }
    }
  }
}

