import { isDefined } from '../../../core/utils/type';
import { roundToThreeDecimals } from './draw_utils';

function splitRectsByPages(rects, margin, topLeft, maxBottomRight, onSeparateRectHorizontally) {
    if(!isDefined(rects) || rects.length === 0) { // Empty Table
        return [[]];
    }

    const rectsByPage = splitRectsHorizontalByPages(rects, margin, topLeft, maxBottomRight, onSeparateRectHorizontally);
    // TODO: splitRectsVerticalByPages

    return rectsByPage;
}

function splitRectsHorizontalByPages(rects, margin, topLeft, maxBottomRight, onSeparateRectHorizontally) {
    const pages = [];
    const rectsToSplit = [...rects];

    while(rectsToSplit.length > 0) {
        let currentPageMaxRectRight = 0;
        const currentPageRects = rectsToSplit.filter(rect => {
            const currentRectRight = roundToThreeDecimals(rect.x + rect.w);
            if(currentRectRight <= maxBottomRight.x) {
                if(currentPageMaxRectRight <= currentRectRight) {
                    currentPageMaxRectRight = currentRectRight;
                }
                return true;
            } else {
                return false;
            }
        });

        const rectsToSeparate = rectsToSplit.filter(rect => {
            // Check cells that have 'rect.x' less than 'currentPageMaxRectRight'
            const currentRectLeft = roundToThreeDecimals(rect.x);
            const currentRectRight = roundToThreeDecimals(rect.x + rect.w);
            if(currentRectLeft < currentPageMaxRectRight && currentPageMaxRectRight < currentRectRight) {
                return true;
            }
        });

        rectsToSeparate.forEach(rect => {
            const args = {
                sourceRect: rect,
                leftRect: {
                    x: rect.x,
                    y: rect.y,
                    w: currentPageMaxRectRight - rect.x,
                    h: rect.h
                },
                rightRect: {
                    x: currentPageMaxRectRight,
                    y: rect.y,
                    w: rect.w - (currentPageMaxRectRight - rect.x),
                    h: rect.h
                }
            };
            onSeparateRectHorizontally(args);

            currentPageRects.push(args.leftRect);
            rectsToSplit.push(args.rightRect);

            const index = rectsToSplit.indexOf(rect);
            if(index !== -1) {
                rectsToSplit.splice(index, 1);
            }
        });

        currentPageRects.forEach(rect => {
            const index = rectsToSplit.indexOf(rect);
            if(index !== -1) {
                rectsToSplit.splice(index, 1);
            }
        });

        rectsToSplit.forEach(rect => {
            rect.x = (currentPageMaxRectRight !== undefined) ? (rect.x - currentPageMaxRectRight + margin.left + topLeft.x) : rect.x;
        });

        if(currentPageRects.length > 0) {
            pages.push(currentPageRects);
        } else {
            pages.push(rectsToSplit);
            break;
        }
    }

    return pages;
}

export { splitRectsByPages };
